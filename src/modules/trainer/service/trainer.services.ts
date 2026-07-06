import mongoose from "mongoose";
import { ITrainerService } from '@/modules/trainer/interface/trainer-service.interface';
import { IUserRepository } from '@/modules/user/interface/user-repository.interface';
import { ITrainerProfileRepository } from '@/modules/trainer/interface/trainer.profile-repository.interface';
import { IS3Service } from '@/modules/s3/interface/s3-service.interface';
import {
  FindTrainerResponseDto,
  TrainerProfileDto,
  TrainerStatusResponseDto,
  UpdateTrainerProfileDto,
  GetAllTrainersDto,
  GetAllTrainersResponseDto,
  GetTrainerAppointmentsQueryDto,
  GetTrainerAppointmentsResponseDto,
  GetTrainerByIdResponseDto,
  ApproveTrainerResponseDto,
  RejectTrainerResponseDto,
} from "../dto/trainer.dto";
import { ROLES } from "@/constants/roles";
import { PaginatedResponseDto } from "../../../dto/common.dto";
import { PaginatedResult } from '@/modules/base/interface/common.interface';

import { AppError } from "../../../utils/appError";
import { STATUS } from "../../../constants/statuscode";
import { MESSAGES } from "../../../constants/messages";
import { TrainerMapper } from "../mapper/trainer.mapper";
import { VERIFICATION_STATUS } from "../../../constants/verification.constants";
import { inject, injectable } from "inversify";
import { USER_TYPES } from "@/modules/user/user.types";
import { TRAINER_TYPES } from "../trainer.types";

@injectable()
export class TrainerService implements ITrainerService {
  constructor(
    @inject(USER_TYPES.UserRepository)
    private _userRepository: IUserRepository,
    @inject(TRAINER_TYPES.TrainerProfileRepository)
    private _trainerProfileRepository: ITrainerProfileRepository,
    @inject(USER_TYPES.S3Service)
    private _s3Service: IS3Service,
  
 
  ) {}

  //Profile
  async fetchTrainer(trainerId: string): Promise<FindTrainerResponseDto> {
    const trainer = await this._userRepository.findById(trainerId);
    if (!trainer) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.TRAINER.NOT_FOUND);
    }
    const profile = await this._trainerProfileRepository.findByUserId(trainerId);
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

    const updatedUser = await this._userRepository.updateProfile(
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
      await this._trainerProfileRepository.upsert({ userId: trainerId }, profileFields);
    }

    const profile = await this._trainerProfileRepository.findByUserId(trainerId);
    return TrainerMapper.toProfileResponse(updatedUser, profile);
  }

  async uploadTrainerProfilePicture(
    trainerId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const trainer = await this._userRepository.findById(trainerId);
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

    await this._userRepository.updateProfile(trainerId, {
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
    const existing = await this._trainerProfileRepository.findByUserId(userId);

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

    await this._userRepository.updateProfile(userId, userUpdateFields);

    const certifications = certificateUrl 
      ? [certificateUrl] 
      : (existing?.certifications || []);
    
    const coverPhoto = coverPhotoUrl 
      ? coverPhotoUrl 
      : (existing?.coverPhoto || "");

    if (existing?.verificationStatus === VERIFICATION_STATUS.REJECTED) {
      await this._trainerProfileRepository.updateToReapply(userId, {
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

    await this._trainerProfileRepository.createProfile({
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

    const response = await this._trainerProfileRepository.fetchTrainerStatus(userId);
    if (!response) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.TRAINER.TRAINERS_FETCHED_FAILED,
      );
    }

    return response;
  }


  // Admin Methods
  async fetchTrainers(
    query: GetAllTrainersDto,
  ): Promise<PaginatedResponseDto<GetAllTrainersResponseDto>> {
    const { data, pagination } = await this._userRepository.findByRolePaginated(
      ROLES.TRAINER,
      query.search,
      query.sortBy,
      query.sortOrder,
      query.page,
      query.limit,
    );

    const page = query.page || 1;
    const limit = query.limit || 10;
    const totalPages = Math.ceil(pagination.totalItems / limit);

    return {
      data: TrainerMapper.toGetAllTrainersResponseList(data),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: pagination.totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async blockTrainer(trainerId: string): Promise<void> {
    if (!trainerId)
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
    await this._userRepository.updateBlockStatus(trainerId, true);
  }

  async unblockTrainer(trainerId: string): Promise<void> {
    if (!trainerId)
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
    await this._userRepository.updateBlockStatus(trainerId, false);
  }

  async getTrainerAppointments(
    query: GetTrainerAppointmentsQueryDto,
  ): Promise<PaginatedResult<GetTrainerAppointmentsResponseDto>> {
    const { data, pagination } =
      await this._trainerProfileRepository.findAllWithUserPaginated(
        query.search,
        query.sortBy,
        query.sortOrder,
        query.page,
        query.limit,
        query.status,
      );

    return {
      data: TrainerMapper.toDtoArray(data),
      pagination,
    };
  }

  async getTrainerByProfileId(
    profileId: string,
  ): Promise<GetTrainerByIdResponseDto> {
    const trainer =
      await this._trainerProfileRepository.findByIdWithUser(profileId);
    if (!trainer)
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.TRAINER.NOT_FOUND);
    return TrainerMapper.toDetailDto(trainer);
  }

  async approveTrainer(profileId: string): Promise<ApproveTrainerResponseDto> {
    const profile = await this._trainerProfileRepository.findById(profileId);
    if (!profile)
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.ADMIN.TRAINER_PROFILE_NOT_FOUND,
      );

    if (profile.verificationStatus === VERIFICATION_STATUS.APPROVED) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.ADMIN.VERIFICATION_APPROVED_EXISTS,
      );
    }

    const updated =
      await this._trainerProfileRepository.updateVerificationStatus(
        profileId,
        VERIFICATION_STATUS.APPROVED,
        null,
      );

    if (!updated)
      throw new AppError(
        STATUS.INTERNAL_ERROR,
        MESSAGES.ADMIN.VERIFICATION_APPROVED_FAILED,
      );

    return TrainerMapper.toApproveTrainerResponse(updated);
  }

  async rejectTrainer(
    profileId: string,
    reason: string,
  ): Promise<RejectTrainerResponseDto> {
    if (!reason?.trim()) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.VALIDATION.REQUIRED_FIELD,
      );
    }

    const profile = await this._trainerProfileRepository.findById(profileId);
    if (!profile)
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.ADMIN.TRAINER_PROFILE_NOT_FOUND,
      );

    const updated =
      await this._trainerProfileRepository.updateVerificationStatus(
        profileId,
        VERIFICATION_STATUS.REJECTED,
        reason,
      );

    if (!updated)
      throw new AppError(
        STATUS.INTERNAL_ERROR,
        MESSAGES.ADMIN.TRAINER_FAILED_TO_REJECTED,
      );

    return TrainerMapper.toRejectTrainerResponse(updated);
  }

  // // --- TRAINER AVAILABILITY & BOOKINGS ---

  // async createAvailability(trainerId: string, data: CreateAvailabilityDto): Promise<{ message: string; availability: TrainerAvailability }> {
  //   const startDate = new Date(data.startDate);
  //   const endDate = new Date(data.endDate);
  //   startDate.setUTCHours(0, 0, 0, 0);
  //   endDate.setUTCHours(0, 0, 0, 0);

  //   if (startDate > endDate) {
  //     throw new AppError(STATUS.BAD_REQUEST, MESSAGES.TRAINER.START_DATE_AFTER_END);
  //   }

  //   const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  //   if (diffDays >= 7) {
  //     throw new AppError(STATUS.BAD_REQUEST, MESSAGES.TRAINER.MAX_AVAILABILITY_DAYS);
  //   }

  //   if (!data.timeWindows || data.timeWindows.length === 0) {
  //     throw new AppError(STATUS.BAD_REQUEST, MESSAGES.TRAINER.TIME_WINDOW_REQUIRED);
  //   }
  //   if (data.timeWindows.length > 4) {
  //     throw new AppError(STATUS.BAD_REQUEST, MESSAGES.TRAINER.MAX_TIME_WINDOWS);
  //   }

  //   const parseTime = (time: string): number => {
  //     const [hours, minutes] = time.split(':').map(Number);
  //     return hours * 60 + minutes;
  //   };

  //   for (const tw of data.timeWindows) {
  //     const startMinutes = parseTime(tw.startTime);
  //     const endMinutes = parseTime(tw.endTime);
  //     if (startMinutes >= endMinutes) {
  //       throw new AppError(STATUS.BAD_REQUEST, MESSAGES.TRAINER.START_TIME_AFTER_END);
  //     }
  //     if ((endMinutes - startMinutes) < data.sessionDuration) {
  //       throw new AppError(STATUS.BAD_REQUEST, `Time window ${tw.startTime}-${tw.endTime} is shorter than the session duration.`);
  //     }
  //   }

  //   const existingAvailabilities = await this._trainerAvailabilityRepo.findByTrainerId(trainerId);
  //   const hasOverlap = existingAvailabilities.some(a => {
  //     if (!a.isActive) return false;
  //     const aStart = new Date(a.startDate).getTime();
  //     const aEnd = new Date(a.endDate).getTime();
  //     const bStart = startDate.getTime();
  //     const bEnd = endDate.getTime();
  //     return bStart <= aEnd && bEnd >= aStart;
  //   });

  //   if (hasOverlap) {
  //     throw new AppError(STATUS.CONFLICT, MESSAGES.TRAINER.OVERLAPPING_AVAILABILITY_RULE);
  //   }

  //   const availabilityData = {
  //     trainerId,
  //     startDate,
  //     endDate,
  //     timeWindows: data.timeWindows,
  //     sessionDuration: data.sessionDuration,
  //     isActive: true,
  //   };
  //   const availability = await this._trainerAvailabilityRepo.create(availabilityData);

  //   return {
  //     message: `Availability configured successfully.`,
  //     availability,
  //   };
  // }

  // async getAvailabilities(trainerId: string, query: GetAvailabilitiesQueryDto): Promise<{ data: TrainerAvailability[]; pagination: PaginationMeta }> {
  //   const page = query.page || 1;
  //   const limit = query.limit || 10;
  //   const sortBy = query.sortBy || 'createdAt';
  //   const sortOrder = query.sortOrder || 'desc';
  //   const status = query.status;

  //   return this._trainerAvailabilityRepo.findByTrainerIdPaginated(trainerId, page, limit, sortBy, sortOrder, status);
  // }

  // async updateAvailabilityStatus(trainerId: string, availabilityId: string, data: UpdateAvailabilityDto): Promise<TrainerAvailability> {
  //   const availability = await this._trainerAvailabilityRepo.findById(availabilityId);
  //   if (!availability) {
  //     throw new AppError(STATUS.NOT_FOUND, MESSAGES.TRAINER.AVAILABILITY_NOT_FOUND);
  //   }
  //   if (availability.trainerId.toString() !== trainerId) {
  //     throw new AppError(STATUS.FORBIDDEN, MESSAGES.COMMON.ACCESS_DENIED);
  //   }

  //   const updated = await this._trainerAvailabilityRepo.updateAvailabilityStatus(availabilityId, data.isActive);
  //   if (!updated) {
  //     throw new AppError(STATUS.INTERNAL_ERROR, "Failed to update availability status");
  //   }
  //   return updated;
  // }
}