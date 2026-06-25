import { MESSAGES } from "../../constants/messages";
import { STATUS } from "../../constants/statuscode";
import { ITrainerProfileRepository } from "../../interfaces/repository-interface/trainer/trainer.profile-repository.interface";
import { IUserRepository } from "../../interfaces/repository-interface/user/user-repository.interface";
import { IPaymentService } from "../../interfaces/service-interface/payment/stripe-service.interface";
import { IS3Service } from "../../interfaces/service-interface/s3/s3-service.interface";
import { IUserService } from "../../interfaces/service-interface/user/user-service.interface";
import { UserMapper, UserMappers } from "../../mappers/user/user.mappers";

import { AppError } from "../../utils/appError";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { hashPassword } from "../../utils/password";
import { Timeframe, PLAN_TYPE } from "@/constants/fitness.constant";

import {
  ChangePasswordDto,
  FindUserResponseDto,
  UpdateBmiDto,
  UpdateBmiResponseDto,
  UpdateUserProfileDto,
} from "../../dto/user/user.dto";

import {
  GetTrainersQueryDto,
  TrainerDetailDto,
  TrainerListResponseDto,
} from "../../dto/trainer/trainer.dto";

import { ICategoryRepository } from "../../modules/category/interface/category-repository.interface";
import {
  CategoryQuery,
  GetAllCategoriesResponse,
} from "../../modules/category/interface/category.interface";
import { ROLES } from "@/constants/roles";
import { PaginationMeta } from "@/interfaces/domain.interface/common.interface";
import { IHealthMetrics } from "@/interfaces/service-interface/health.metrics/health.metrics-service.interface";
import { IExerciseRepository } from "../../interfaces/repository-interface/exercise/exercise-repository.interface";
import { IEquipmentRepository } from "../../interfaces/repository-interface/equipment/equipment-repository.interface";
import { ExerciseMapper } from "../../mappers/exercise/exercise.mapper";
import { EquipmentMapper } from "../../mappers/equipment/equipment.mapper";
import { ITrainerBookingRepository } from "../../interfaces/repository-interface/trainer/trainer-booking.repository.interface";
import { ITrainerAvailabilityRepository } from "../../interfaces/repository-interface/trainer/trainer-availability.repository.interface";
import { GetSlotsQueryDto, GetBookingsQueryDto, CreateBookingDto, DynamicSlotDto } from "../../dto/trainer/trainer-booking.dto";
import { PopulatedTrainerBooking } from "../../interfaces/domain.interface/trainer-booking.interface";
import { BOOKING_STATUS } from "../../models/trainer-booking.model";
import { parseTime, formatTime, generateReference } from "../../utils/booking.utils";
import { ExerciseQueryDto, GetAllExercisesResponseDto, ExerciseDto } from "../../dto/exercise/exercise.dto";
import { EquipmentQueryDto, GetAllEquipmentResponseDto } from "../../dto/equipment/equipment.dto";
import { MealCategoryQueryDto, GetAllMealCategoriesResponseDto } from "@/modules/meal-category/dto/meal-category.dto";
import { IMealCategoryRepository } from "@/modules/meal-category/interface/meal-category-repository.interface";
import { ISubscriptionTransactionRepository } from "@/modules/subscription/interface/repository.interface/subscription.transaction-repository.interface";
import { ISubscriptionPlanRepository } from "@/modules/subscription/interface/repository.interface/subscription-plan.repository";
import { IUserSubscriptionRepository } from "@/modules/subscription/interface/repository.interface/user.subscription.repository.interface";
import { ActiveSubscriptionDto} from "@/modules/subscription/dto/subscription.dto";

export class UserService implements IUserService {

  constructor(
    private _userRepo: IUserRepository,
    private _s3Service: IS3Service,
    private _trainerProfileRepo: ITrainerProfileRepository,
    private _paymentService: IPaymentService,
    private _categoryRepo: ICategoryRepository,
    private _subscriptionPlanRepository: ISubscriptionPlanRepository,
    private _subscriptionTransactionRepository: ISubscriptionTransactionRepository,
    private _userSubscriptionRepository: IUserSubscriptionRepository,

    private _healthMetrics: IHealthMetrics,
    private _exerciseRepo: IExerciseRepository,
    private _equipmentRepo: IEquipmentRepository,
    private _trainerBookingRepo: ITrainerBookingRepository,
    private _trainerAvailabilityRepo: ITrainerAvailabilityRepository,
    private _mealCategoryRepo: IMealCategoryRepository
  ) { }

  // Fetch user details
  async fetchUser(userId: string): Promise<FindUserResponseDto> {
    const user = await this._userRepo.findById(userId);
    if (!user)
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.USER.USER_NOT_FOUND);

    let profileData = null;
    if (user.role === ROLES.TRAINER) {
      profileData = await this._trainerProfileRepo.findByUserId(userId);
    }

    return UserMapper.toFindUserResponse(user, profileData);
  }

  // Update user profile
  async updateProfile(
    userId: string,
    updateData: UpdateUserProfileDto,
  ): Promise<FindUserResponseDto> {
    if (Object.keys(updateData).length === 0) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.NO_FIELDS_TO_UPDATE);
    }
    if (updateData.userName) {
      const existingUser = await this._userRepo.findByUsername(
        updateData.userName,
      );
      if (existingUser && existingUser.id !== userId) {
        throw new AppError(STATUS.CONFLICT, MESSAGES.USER.USERNAME_ALREADY_EXISTS);
      }
    }

    if (updateData.dateOfBirth) {
      const dob = new Date(updateData.dateOfBirth);
      const today = new Date();
      const limitDate = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate(),
      );
      if (dob > limitDate) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.USER.AGE_RESTRICTION);
      }
    }
    const updatedUser = await this._userRepo.updateProfile(userId, updateData);
    if (!updatedUser)
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.USER.USER_NOT_FOUND);

    // Update profile data
    if (updateData.gender || updateData.dateOfBirth) {
      const profileUpdates = {
        gender: updateData.gender,
        dateOfBirth: updateData.dateOfBirth
          ? new Date(updateData.dateOfBirth)
          : undefined,
      };

      if (updatedUser.role === ROLES.TRAINER) {
        await this._trainerProfileRepo.upsert({ userId }, profileUpdates);
      }
    }

    return this.fetchUser(userId);
  }

  // Upload profile picture
  async uploadProfilePicture(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const user = await this._userRepo.findById(userId);
    if (!user)
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.USER.USER_NOT_FOUND);
    if (user.profilePic) {
      try {
        await this._s3Service.deleteFile(user.profilePic);
      } catch {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.USER.PROFILE_PICTURE_DELETE_FAILED)
      }
    }
    const profilePicUrl = await this._s3Service.uploadFile(
      file,
      `profile-pictures/${userId}`,
    );
    await this._userRepo.updateProfile(userId, { profilePic: profilePicUrl });
    return profilePicUrl;
  }

  // Change user password
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this._userRepo.findById(userId);
    if (!user)
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.USER.USER_NOT_FOUND);

    const match = await bcrypt.compare(dto.currentPassword, user.password);
    if (!match)
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.PASSWORD.INCORRECT_CURRENT_PASSWORD,
      );

    const sameAsOld = await bcrypt.compare(dto.newPassword, user.password);
    if (sameAsOld)
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.PASSWORD.NEW_PASSWORD_SAME_AS_OLD,
      );

    const hashedPassword = await hashPassword(dto.newPassword);
    await this._userRepo.updatePassword(userId, hashedPassword);
  }

  // Fetch all trainers
  async getTrainers(
    query: GetTrainersQueryDto,
  ): Promise<TrainerListResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 9;

    const { data, total } =
      await this._trainerProfileRepo.getApprovedTrainersPaginated(
        page,
        limit,
        query.search,
        query.sortBy,
        query.sortOrder,
        query.specializationId,
      );

    return {
      data: UserMappers.toListItemDtoArray(data),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  // Fetch trainer details
  async getTrainerById(trainerId: string): Promise<TrainerDetailDto> {
    const data =
      await this._trainerProfileRepo.getTrainerByIdWithUser(trainerId);
    if (!data) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.TRAINER.NOT_FOUND);
    }

    const specializationIds = Array.isArray(data.profile.specializations)
      ? data.profile.specializations.map((spec: unknown) => String((spec as { _id?: mongoose.Types.ObjectId })._id || spec))
      : [];

    const relatedTrainers = await this._trainerProfileRepo.findRelatedTrainers(
      specializationIds,
      data.profile._id.toString(),
      4
    );

    return UserMappers.toTrainerDetailDto(data, relatedTrainers);
  }

  // Fetch all categories
  async getCategories(query: CategoryQuery): Promise<GetAllCategoriesResponse> {
    return this._categoryRepo.getAllCategories({
      ...query,
      isActive: true,
    } as CategoryQuery);
  }



  // Fetch all equipment
  async getAllEquipment(query: EquipmentQueryDto): Promise<GetAllEquipmentResponseDto> {
    const { data, pagination } = await this._equipmentRepo.getAllEquipment({
      ...query,
      isActive: true,
    } as EquipmentQueryDto);

    return {
      data: EquipmentMapper.toEquipmentDtoList(data),
      pagination,
    };
  }

  // Fetch all meal categories
  async getMealCategories(query: MealCategoryQueryDto): Promise<GetAllMealCategoriesResponseDto> {
    const { data, pagination } = await this._mealCategoryRepo.getAllMealCategories({
      ...query,
      isActive: true,
    } as MealCategoryQueryDto);

    return {
      data: data.map(item => ({
        mealCategoryId: item.mealCategoryId || "",
        title: item.title,
        description: item.description,
        isActive: item.isActive
      })),
      pagination,
    };
  }

  // Fetch user subscriptions


  // Fetch active subscription
  async getActiveSubscription(
    userId: string,
 
  ): Promise<ActiveSubscriptionDto | null> {
    const sub =
      await this._userSubscriptionRepository.findActiveByUserId(userId);
    if (!sub) return null;

    const plan = sub.subscriptionPlanId as unknown as {
      _id: unknown;
      name: string;
    };

    const daysRemaining = Math.max(
      0,
      Math.ceil(
        (new Date(sub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      ),
    );

    return {
      subscriptionId: String(sub._id),
      subscriptionPlanId: plan?._id ? String(plan._id) : "",
      planName: plan?.name ?? "Unknown",
      startDate: sub.startDate,
      endDate: sub.endDate,
      status: sub.status,
      daysRemaining,
    };
  }





  // Calculate user BMI
  async calculateBmi(data: UpdateBmiDto): Promise<UpdateBmiResponseDto> {
    return this._healthMetrics.bmiCalculator(data);
  }

  // Fetch all exercises
  async getExercises(query: ExerciseQueryDto): Promise<GetAllExercisesResponseDto> {
    const result = await this._exerciseRepo.getAllExercises({
      ...query,
    });

    return {
      data: ExerciseMapper.toExerciseDtoList(result.data),
      pagination: result.pagination,
    };
  }

  // Fetch exercise details
  async getExerciseById(id: string): Promise<ExerciseDto> {
    const exercise = await this._exerciseRepo.getExerciseById(id);
    if (!exercise) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.EXERCISE.NOT_FOUND);
    }

    return ExerciseMapper.toExerciseDto(exercise);
  }

  // --- TRAINER BOOKING (USER SIDE) ---

  async getAvailableSlots(trainerIdOrProfileId: string, query: GetSlotsQueryDto): Promise<DynamicSlotDto[]> {
    const from = query.from ? new Date(query.from) : new Date();
    from.setUTCHours(0, 0, 0, 0);
    const to = query.to ? new Date(query.to) : new Date(from);
    to.setDate(to.getDate() + 30);
    to.setUTCHours(0, 0, 0, 0);

    let trainerId = trainerIdOrProfileId;
    try {
      const profile = await this._trainerProfileRepo.findById(trainerIdOrProfileId);
      if (profile && profile.userId) {
        trainerId = profile.userId.toString();
      }
    } catch {
      // Ignore error if it's not a profile ID
    }

    const availabilities = await this._trainerAvailabilityRepo.findByTrainerId(trainerId);
    const activeAvailabilities = availabilities.filter(a => a.isActive);

    if (activeAvailabilities.length === 0) return [];

    const availableSlots: DynamicSlotDto[] = [];
    const uniqueDatesWithSlots = new Set<string>();

    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      if (uniqueDatesWithSlots.size >= 7) break;

      const currentDate = new Date(d);
      const dateStr = currentDate.toISOString().split('T')[0];
      let addedSlotForThisDate = false;

      const matchingRules = activeAvailabilities.filter(a =>
        currentDate >= a.startDate && currentDate <= a.endDate
      );

      for (const rule of matchingRules) {
        for (const tw of rule.timeWindows) {
          let currentStartMinutes = parseTime(tw.startTime);
          const endMinutes = parseTime(tw.endTime);

          while (currentStartMinutes + rule.sessionDuration <= endMinutes) {
            const slotStartMinutes = currentStartMinutes;
            const slotEndMinutes = currentStartMinutes + rule.sessionDuration;

            const startTimeStr = formatTime(slotStartMinutes);
            const endTimeStr = formatTime(slotEndMinutes);

            const slotStartDateTime = new Date(`${currentDate.toISOString().split('T')[0]}T${startTimeStr}:00`);
            if (slotStartDateTime <= new Date()) {
              currentStartMinutes += rule.sessionDuration;
              continue;
            }

            const hasOverlap = await this._trainerBookingRepo.hasOverlappingBooking(
              trainerId,
              currentDate,
              startTimeStr,
              endTimeStr
            );

            if (!hasOverlap) {
              availableSlots.push({
                date: dateStr,
                startTime: startTimeStr,
                endTime: endTimeStr,
              });
              addedSlotForThisDate = true;
            }

            currentStartMinutes += rule.sessionDuration;
          }
        }
      }

      if (addedSlotForThisDate) {
        uniqueDatesWithSlots.add(dateStr);
      }
    }

    return availableSlots;
  }

  async createBooking(userId: string, data: CreateBookingDto): Promise<PopulatedTrainerBooking> {
    const activeSub = await this._userSubscriptionRepository.findActiveByUserId(userId);
    if (!activeSub) {
      throw new AppError(STATUS.FORBIDDEN, MESSAGES.USER.PREMIUM_REQUIRED_FOR_TRAINER);
    }

    let actualTrainerUserId = data.trainerId;
    let trainerProfile = await this._trainerProfileRepo.findByUserId(actualTrainerUserId);

    if (!trainerProfile) {
      try {
        const profileByDocId = await this._trainerProfileRepo.findById(actualTrainerUserId);
        if (profileByDocId) {
          actualTrainerUserId = profileByDocId.userId.toString();
          trainerProfile = profileByDocId;
        }
      } catch {
        // Ignore error if it's not a profile ID
      }
    }

    if (!trainerProfile || trainerProfile.verificationStatus !== "approved") {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.TRAINER.NOT_FOUND);
    }

    data.trainerId = actualTrainerUserId;

    const bookingDate = new Date(data.date);
    bookingDate.setUTCHours(0, 0, 0, 0);

    const slotStartDateTime = new Date(`${bookingDate.toISOString().split('T')[0]}T${data.startTime}:00`);
    if (slotStartDateTime <= new Date()) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.TRAINER.PAST_SLOT_BOOKING);
    }

    const hasOverlap = await this._trainerBookingRepo.hasOverlappingBooking(
      data.trainerId,
      bookingDate,
      data.startTime,
      data.endTime
    );
    if (hasOverlap) {
      throw new AppError(STATUS.CONFLICT, MESSAGES.TRAINER.SLOT_UNAVAILABLE_OR_CONFLICT);
    }

    const bookingData = {
      userId,
      trainerId: data.trainerId,
      bookingReference: generateReference(),
      bookingType: data.bookingType || "ONLINE",
      bookingDate,
      startTime: data.startTime,
      endTime: data.endTime,
      status: BOOKING_STATUS.PENDING,
      userNotes: data.userNotes || "",
      statusUpdatedAt: new Date()
    };

    const newBooking = await this._trainerBookingRepo.create(bookingData);

    const populated = await this._trainerBookingRepo.findPopulatedById(newBooking._id);
    return populated!;
  }

  async getUserBookings(userId: string, query: GetBookingsQueryDto): Promise<{ data: PopulatedTrainerBooking[]; pagination: PaginationMeta }> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const date = query.date ? new Date(query.date) : undefined;

    const search = query.search;
    const sortBy = query.sortBy;
    const sortOrder = query.sortOrder;

    return this._trainerBookingRepo.findByUserIdPaginated(userId, page, limit, query.status, date, search, sortBy, sortOrder);
  }

  async cancelBookingByUser(userId: string, bookingId: string, reason?: string): Promise<PopulatedTrainerBooking> {
    if (!reason || reason.trim() === "") throw new AppError(STATUS.BAD_REQUEST, MESSAGES.TRAINER.CANCELLATION_REASON_REQUIRED);

    const booking = await this._trainerBookingRepo.findById(bookingId);
    if (!booking) throw new AppError(STATUS.NOT_FOUND, MESSAGES.TRAINER.BOOKING_NOT_FOUND);
    if (booking.userId.toString() !== userId) throw new AppError(STATUS.FORBIDDEN, MESSAGES.COMMON.ACCESS_DENIED);

    if (booking.status !== BOOKING_STATUS.PENDING && booking.status !== BOOKING_STATUS.APPROVED) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.TRAINER.INVALID_CANCELLATION_STATE);
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
