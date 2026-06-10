import mongoose from "mongoose";
import { ITrainerService } from "../../interfaces/service-interface/trainer/trainer-service.interface";
import { IUserRepository } from "../../interfaces/repository-interface/user/user-repository.interface";
import { ITrainerProfileRepository } from "../../interfaces/repository-interface/trainer/trainer.profile-repository.interface";
import { IS3Service } from "../../interfaces/service-interface/s3/s3-service.interface";
import { ITrainerBookingRepository } from "../../interfaces/repository-interface/trainer/trainer-booking.repository.interface";
import { ITrainerAvailabilityRepository } from "../../interfaces/repository-interface/trainer/trainer-availability.repository.interface";
import { IUserSubscriptionRepository } from "../../interfaces/repository-interface/subscription/user.subscription.repository.interface";
import {
  FindTrainerResponseDto,
  TrainerProfileDto,
  TrainerStatusResponseDto,
  UpdateTrainerProfileDto,
} from "../../dto/trainer/trainer.dto";
import {
  CreateAvailabilityDto,
  UpdateAvailabilityDto,
  GetBookingsQueryDto,
  GetAvailabilitiesQueryDto
} from "../../dto/trainer/trainer-booking.dto";
import { PopulatedTrainerBooking, TrainerAvailability } from "../../interfaces/domain.interface/trainer-booking.interface";
import { PaginationMeta } from "../../interfaces/domain.interface/common.interface";
import { BOOKING_STATUS } from "../../models/trainer-booking.model";
import { parseTime, formatTime, generateReference } from "../../utils/booking.utils";
import { ICategoryRepository } from "../../interfaces/repository-interface/category/category-repository.interface";
import {
  CategoryQuery,
  GetAllCategoriesResponse,
} from "../../interfaces/domain.interface/category.interface";
import { AppError } from "../../utils/appError";
import { STATUS } from "../../constants/statuscode";
import { MESSAGES } from "../../constants/messages";
import { TrainerMapper } from "../../mappers/trainer/trainer.mapper";
import { VERIFICATION_STATUS } from "../../constants/verification.constants";

export class TrainerService implements ITrainerService {
  constructor(
    private _userRepo: IUserRepository,
    private _trainerProfileRepo: ITrainerProfileRepository,
    private _s3Service: IS3Service,
    private _categoryRepo: ICategoryRepository,
    private _trainerBookingRepo: ITrainerBookingRepository,
    private _trainerAvailabilityRepo: ITrainerAvailabilityRepository,
    private _subscriptionRepo: IUserSubscriptionRepository,
  ) {}

  //Profile
  async fetchTrainer(trainerId: string): Promise<FindTrainerResponseDto> {
    const trainer = await this._userRepo.findById(trainerId);
    if (!trainer) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.TRAINER.NOT_FOUND);
    }
    const profile = await this._trainerProfileRepo.findByUserId(trainerId);
    return TrainerMapper.toProfileResponse(trainer, profile);
  }

  async updateTrainerProfile(
    trainerId: string,
    updateData: UpdateTrainerProfileDto,
  ): Promise<FindTrainerResponseDto> {
    if (Object.keys(updateData).length === 0) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.NO_FIELDS_TO_UPDATE);
    }



    if (!updateData.dateOfBirth) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.COMMON.SELECT_CORRECT_DOB);
    }

    const dob = new Date(updateData.dateOfBirth);
    const today = new Date();
    const limitDate = new Date(
      today.getFullYear() - 15,
      today.getMonth(),
      today.getDate(),
    );

    if (dob > limitDate) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.TRAINER.AGE_RESTRICTION,
      );
    }

    const updatedUser = await this._userRepo.updateProfile(
      trainerId,
      updateData,
    );
    if (!updatedUser) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.TRAINER.NOT_FOUND);
    }

    const profileFields: Record<string, unknown> = {};
    if (updateData.experienceInYears !== undefined) {
      profileFields.experienceInYears = updateData.experienceInYears;
    }
    if (updateData.bio !== undefined) {
      profileFields.bio = updateData.bio;
    }
    if (updateData.gender !== undefined) {
      profileFields.gender = updateData.gender;
    }
    if (updateData.dateOfBirth !== undefined) {
      profileFields.dateOfBirth = new Date(updateData.dateOfBirth);
    }
    if (updateData.specializations !== undefined) {
      profileFields.specializations = updateData.specializations.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
    }

    if (Object.keys(profileFields).length > 0) {
      await this._trainerProfileRepo.upsert({ userId: trainerId }, profileFields);
    }

    const profile = await this._trainerProfileRepo.findByUserId(trainerId);
    return TrainerMapper.toProfileResponse(updatedUser, profile);
  }

  async uploadTrainerProfilePicture(
    trainerId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const trainer = await this._userRepo.findById(trainerId);
    if (!trainer) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.TRAINER.NOT_FOUND);
    }

    if (trainer.profilePic) {
      try {
        await this._s3Service.deleteFile(trainer.profilePic);
      } catch  {
        throw new AppError(STATUS.BAD_REQUEST,MESSAGES.USER.PROFILE_PICTURE_DELETE_FAILED)
      }
    }

    const profilePicUrl = await this._s3Service.uploadFile(
      file,
      `profile-pictures/${trainerId}`,
    );

    await this._userRepo.updateProfile(trainerId, {
      profilePic: profilePicUrl,
    });

    return profilePicUrl;
  }

  async uploadTrainerDocument(file: Express.Multer.File): Promise<string> {
    const documentUrl = await this._s3Service.uploadFile(
      file,
      "trainer-certificates",
    );
    return documentUrl;
  }

  // Trainer Application
  async createProfile(userId: string, data: TrainerProfileDto): Promise<void> {
    const existing = await this._trainerProfileRepo.findByUserId(userId);

    if (existing?.verificationStatus === VERIFICATION_STATUS.PENDING) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.TRAINER.TRAINER_PROFILE_EXISTS,
      );
    }
    if (existing?.verificationStatus === VERIFICATION_STATUS.APPROVED) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.ADMIN.VERIFICATION_APPROVED_EXISTS,
      );
    }
    if (
      existing?.verificationStatus === VERIFICATION_STATUS.REJECTED &&
      existing.applyCount >= 2
    ) {
      throw new AppError(
        STATUS.FORBIDDEN,
        MESSAGES.TRAINER.MAX_APPLICATIONS_REACHED,
      );
    }

    let certificateUrl = "";
    if (data.certificateFile) {
      certificateUrl = await this._s3Service.uploadFile(
        data.certificateFile,
        "trainer-certificates",
      );
    }

    let profileImageUrl = "";
    if (data.profileImageFile) {
      profileImageUrl = await this._s3Service.uploadFile(
        data.profileImageFile,
        "trainer-profile-images",
      );
    }

    let coverPhotoUrl = "";
    if (data.coverImageFile) {
      coverPhotoUrl = await this._s3Service.uploadFile(
        data.coverImageFile,
        "trainer-cover-photos",
      );
    }

    const userUpdateFields: Record<string, unknown> = {
      gender: data.gender,
    };
    if (data.dateOfBirth) {
      userUpdateFields.dateOfBirth = new Date(data.dateOfBirth);
    }
    if (profileImageUrl) {
      userUpdateFields.profilePic = profileImageUrl;
    }

    await this._userRepo.updateProfile(userId, userUpdateFields);

    const certifications = certificateUrl 
      ? [certificateUrl] 
      : (existing?.certifications || []);
    
    const coverPhoto = coverPhotoUrl 
      ? coverPhotoUrl 
      : (existing?.coverPhoto || "");

    if (existing?.verificationStatus === VERIFICATION_STATUS.REJECTED) {
      await this._trainerProfileRepo.updateToReapply(userId, {
        experienceInYears: data.experienceInYears,
        certifications,
        bio: data.bio,
        coverPhoto,
        specializations: data.specializationIds,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      });
      return;
    }

    await this._trainerProfileRepo.createProfile({
      userId: new mongoose.Types.ObjectId(userId),
      experienceInYears: data.experienceInYears,
      coverPhoto,
      certifications,
      bio: data.bio,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      specializations: data.specializationIds.map(
        (id) => new mongoose.Types.ObjectId(id),
      ),
      verificationStatus: VERIFICATION_STATUS.PENDING,
      rejectionReason: null,
      applyCount: 1,
    });
  }

  async getTrainerStatus(userId: string): Promise<TrainerStatusResponseDto> {
    if (!userId) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.TRAINER.NOT_FOUND);
    }

    const response = await this._trainerProfileRepo.fetchTrainerStatus(userId);
    if (!response) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.TRAINER.TRAINERS_FETCHED_FAILED,
      );
    }

    return response;
  }

  async getCategories(query: CategoryQuery): Promise<GetAllCategoriesResponse> {
    return this._categoryRepo.getAllCategories({
      ...query,
      isActive: true,
    } as CategoryQuery);
  }

  // --- TRAINER AVAILABILITY & BOOKINGS ---

  async createAvailability(trainerId: string, data: CreateAvailabilityDto): Promise<{ message: string; availability: TrainerAvailability }> {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(0, 0, 0, 0);

    if (startDate > endDate) {
      throw new AppError(STATUS.BAD_REQUEST, "Start date cannot be after end date.");
    }

    const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 7) {
      throw new AppError(STATUS.BAD_REQUEST, "Availability can be created for a maximum of 7 days.");
    }

    if (!data.timeWindows || data.timeWindows.length === 0) {
      throw new AppError(STATUS.BAD_REQUEST, "At least one time window is required.");
    }
    if (data.timeWindows.length > 4) {
      throw new AppError(STATUS.BAD_REQUEST, "Maximum of 4 time windows allowed.");
    }

    for (const tw of data.timeWindows) {
      const startMinutes = parseTime(tw.startTime);
      const endMinutes = parseTime(tw.endTime);
      if (startMinutes >= endMinutes) {
        throw new AppError(STATUS.BAD_REQUEST, "Start time must be before end time in a time window.");
      }
      if ((endMinutes - startMinutes) < data.sessionDuration) {
        throw new AppError(STATUS.BAD_REQUEST, `Time window ${tw.startTime}-${tw.endTime} is shorter than the session duration.`);
      }
    }

    const existingAvailabilities = await this._trainerAvailabilityRepo.findByTrainerId(trainerId);
    const hasOverlap = existingAvailabilities.some(a => {
      if (!a.isActive) return false;
      const aStart = new Date(a.startDate).getTime();
      const aEnd = new Date(a.endDate).getTime();
      const bStart = startDate.getTime();
      const bEnd = endDate.getTime();
      return bStart <= aEnd && bEnd >= aStart;
    });

    if (hasOverlap) {
      throw new AppError(STATUS.CONFLICT, "You already have an active availability rule that overlaps with this date range.");
    }

    const availabilityData = {
      trainerId,
      startDate,
      endDate,
      timeWindows: data.timeWindows,
      sessionDuration: data.sessionDuration,
      isActive: true,
    };
    const availability = await this._trainerAvailabilityRepo.create(availabilityData);

    return {
      message: `Availability configured successfully.`,
      availability,
    };
  }

  async getAvailabilities(trainerId: string, query: GetAvailabilitiesQueryDto): Promise<{ data: TrainerAvailability[]; pagination: PaginationMeta }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';
    const status = query.status;

    return this._trainerAvailabilityRepo.findByTrainerIdPaginated(trainerId, page, limit, sortBy, sortOrder, status);
  }

  async updateAvailabilityStatus(trainerId: string, availabilityId: string, data: UpdateAvailabilityDto): Promise<TrainerAvailability> {
    const availability = await this._trainerAvailabilityRepo.findById(availabilityId);
    if (!availability) {
      throw new AppError(STATUS.NOT_FOUND, "Availability configuration not found.");
    }
    if (availability.trainerId.toString() !== trainerId) {
      throw new AppError(STATUS.FORBIDDEN, MESSAGES.COMMON.ACCESS_DENIED);
    }

    if (!data.isActive) {
      const hasActive = await this._trainerBookingRepo.hasActiveBookingsBetweenDates(
        trainerId,
        availability.startDate,
        availability.endDate
      );
      if (hasActive) {
        throw new AppError(STATUS.BAD_REQUEST, "Cannot deactivate availability because there are active bookings in this period. Please cancel or reject them first.");
      }
    }

    const updated = await this._trainerAvailabilityRepo.updateAvailabilityStatus(availabilityId, data.isActive);
    return updated!;
  }

  async getTrainerBookings(trainerId: string, query: GetBookingsQueryDto): Promise<{ data: PopulatedTrainerBooking[]; pagination: PaginationMeta }> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const date = query.date ? new Date(query.date) : undefined;

    const search = query.search;
    const sortBy = query.sortBy;
    const sortOrder = query.sortOrder;

    return this._trainerBookingRepo.findByTrainerIdPaginated(trainerId, page, limit, query.status, date, search, sortBy, sortOrder);
  }

  async confirmBooking(trainerId: string, bookingId: string): Promise<PopulatedTrainerBooking> {
    const booking = await this._trainerBookingRepo.findById(bookingId);
    if (!booking) throw new AppError(STATUS.NOT_FOUND, MESSAGES.TRAINER.BOOKING_NOT_FOUND);
    if (booking.trainerId.toString() !== trainerId) throw new AppError(STATUS.FORBIDDEN, MESSAGES.COMMON.ACCESS_DENIED);

    if (booking.status !== BOOKING_STATUS.PENDING) {
      throw new AppError(STATUS.BAD_REQUEST, "Invalid state transition. Only PENDING bookings can be APPROVED.");
    }

    const updated = await this._trainerBookingRepo.updateStatus(bookingId, {
      status: BOOKING_STATUS.APPROVED,
      approvedAt: new Date(),
      statusUpdatedAt: new Date()
    });
    return updated!;
  }

  async rejectBooking(trainerId: string, bookingId: string, reason: string): Promise<PopulatedTrainerBooking> {
    if (!reason || reason.trim() === "") throw new AppError(STATUS.BAD_REQUEST, "Rejection reason is required.");

    const booking = await this._trainerBookingRepo.findById(bookingId);
    if (!booking) throw new AppError(STATUS.NOT_FOUND, MESSAGES.TRAINER.BOOKING_NOT_FOUND);
    if (booking.trainerId.toString() !== trainerId) throw new AppError(STATUS.FORBIDDEN, MESSAGES.COMMON.ACCESS_DENIED);

    if (booking.status !== BOOKING_STATUS.PENDING) {
      throw new AppError(STATUS.BAD_REQUEST, "Invalid state transition. Only PENDING bookings can be REJECTED.");
    }

    const updated = await this._trainerBookingRepo.updateStatus(bookingId, {
      status: BOOKING_STATUS.REJECTED,
      rejectionReason: reason,
      rejectedAt: new Date(),
      statusUpdatedAt: new Date()
    });
    return updated!;
  }

  async completeBooking(trainerId: string, bookingId: string): Promise<PopulatedTrainerBooking> {
    const booking = await this._trainerBookingRepo.findById(bookingId);
    if (!booking) throw new AppError(STATUS.NOT_FOUND, MESSAGES.TRAINER.BOOKING_NOT_FOUND);
    if (booking.trainerId.toString() !== trainerId) throw new AppError(STATUS.FORBIDDEN, MESSAGES.COMMON.ACCESS_DENIED);

    if (booking.status !== BOOKING_STATUS.APPROVED) {
      throw new AppError(STATUS.BAD_REQUEST, "Invalid state transition. Only APPROVED bookings can be COMPLETED.");
    }

    const updated = await this._trainerBookingRepo.updateStatus(bookingId, {
      status: BOOKING_STATUS.COMPLETED,
      completedAt: new Date(),
      statusUpdatedAt: new Date()
    });
    return updated!;
  }

  async cancelBookingByTrainer(trainerId: string, bookingId: string, reason?: string): Promise<PopulatedTrainerBooking> {
    if (!reason || reason.trim() === "") throw new AppError(STATUS.BAD_REQUEST, "Cancellation reason is required.");

    const booking = await this._trainerBookingRepo.findById(bookingId);
    if (!booking) throw new AppError(STATUS.NOT_FOUND, MESSAGES.TRAINER.BOOKING_NOT_FOUND);
    if (booking.trainerId.toString() !== trainerId) throw new AppError(STATUS.FORBIDDEN, MESSAGES.COMMON.ACCESS_DENIED);

    if (booking.status !== BOOKING_STATUS.PENDING && booking.status !== BOOKING_STATUS.APPROVED) {
      throw new AppError(STATUS.BAD_REQUEST, "Invalid state transition. Only PENDING or APPROVED bookings can be CANCELLED.");
    }

    const updated = await this._trainerBookingRepo.updateStatus(bookingId, {
      status: BOOKING_STATUS.CANCELLED,
      cancellationReason: reason,
      cancelledAt: new Date(),
      statusUpdatedAt: new Date()
    });
    return updated!;
  }
}
