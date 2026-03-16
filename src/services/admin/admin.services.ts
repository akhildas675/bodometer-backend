import { MESSAGES } from "@/constants/messages";
import { STATUS } from "@/constants/statuscode";
import { VERIFICATION_STATUS } from "@/constants/verification.constants";
import { ROLES } from "@/constants/roles";

import {
  AddWorkoutDto,
  AddWorkoutResponseDto,
  AdminGetTrainersDto,
  AdminGetTrainersResponseDto,
  AdminGetUsersDto,
  AdminGetUsersResponseDto,
  CreateSubscriptionDTO,
  GetTrainerAppointmentsQueryDto,
  PaginatedResponseDto,
  SubscriptionResponseDTO,
  UpdateSubscriptionDTO,
} from "@/dto/admin/admin.dto";
import {
  ApproveTrainerResponseDto,
  GetTrainerAppointmentsResponseDto,
  GetTrainerByIdResponseDto,
  RejectTrainerResponseDto,
} from "@/dto/trainer/trainer.dto";

import { IAdminService } from "@/interfaces/admin/admin-service.interface";
import { PaginatedResult, Workout } from "@/interfaces/admin/admin.interface";
import { IUserRepository } from "@/interfaces/user/user-repository.interface";
import { ITrainerProfileRepository } from "@/interfaces/trainer/trainer.profile-repository.interface";
import { IWorkoutRepository } from "@/interfaces/workout/workout-repository.interface";
import { ISubscriptionRepository } from "@/interfaces/subscription/subscription-repository.interface";
import { IS3Service } from "@/interfaces/s3/s3-service.interface";

// ✅ all mappers from admin.mappers.ts
import {
  AdminAccountMapper,
  TrainerMapper,
  WorkoutMapper,
} from "@/mappers/admin/admin.mappers";
import { SubscriptionMapper } from "@/mappers/admin/subscription.mapper";
import { AppError } from "@/utils/appError";

export class AdminService implements IAdminService {
  constructor(
    private _userRepo: IUserRepository,
    private _trainerProfileRepo: ITrainerProfileRepository,
    private _workoutRepo: IWorkoutRepository,
    private _subscriptionRepo: ISubscriptionRepository,
    private _s3Service: IS3Service,
  ) {}

  //  Users
  async fetchUsers(
    query: AdminGetUsersDto,
  ): Promise<PaginatedResponseDto<AdminGetUsersResponseDto>> {
    const { data, pagination } = await this._userRepo.findByRolePaginated(
      ROLES.USER,
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
      data: AdminAccountMapper.toResponseList(data),
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

  async blockUser(userId: string): Promise<void> {
    if (!userId) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
    await this._userRepo.updateBlockStatus(userId, true);
  }

  async unblockUser(userId: string): Promise<void> {
    if (!userId) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
    await this._userRepo.updateBlockStatus(userId, false);
  }

  //Trainers 
  async fetchTrainers(
    query: AdminGetTrainersDto,
  ): Promise<PaginatedResponseDto<AdminGetTrainersResponseDto>> {
    const { data, pagination } = await this._userRepo.findByRolePaginated(
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
      data: AdminAccountMapper.toResponseList(data),
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
    if (!trainerId) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
    await this._userRepo.updateBlockStatus(trainerId, true);
  }

  async unblockTrainer(trainerId: string): Promise<void> {
    if (!trainerId) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
    await this._userRepo.updateBlockStatus(trainerId, false);
  }

  async getTrainerAppointments(
    query: GetTrainerAppointmentsQueryDto,
  ): Promise<PaginatedResult<GetTrainerAppointmentsResponseDto>> {
    const { data, pagination } = await this._trainerProfileRepo.findAllWithUserPaginated(
      query.search,
      query.sortBy,
      query.sortOrder,
      query.page,
      query.limit,
      query.status,
    );

    console.log("hit here in admin service")

    return {
      data: TrainerMapper.toDtoArray(data),
      pagination,
    };
  }

  async getTrainerByProfileId(profileId: string): Promise<GetTrainerByIdResponseDto> {
    const trainer = await this._trainerProfileRepo.findByIdWithUser(profileId);
    if (!trainer) throw new AppError(STATUS.NOT_FOUND, MESSAGES.TRAINER.NOT_FOUND);
    return TrainerMapper.toDetailDto(trainer);
  }

  async approveTrainer(profileId: string): Promise<ApproveTrainerResponseDto> {
    const profile = await this._trainerProfileRepo.findById(profileId);
    if (!profile) throw new AppError(STATUS.NOT_FOUND, MESSAGES.ADMIN.TRAINER_PROFILE_NOT_FOUND);

    if (profile.verificationStatus === VERIFICATION_STATUS.APPROVED) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.ADMIN.VERIFICATION_APPROVED_EXISTS);
    }

    const updated = await this._trainerProfileRepo.updateVerificationStatus(
      profileId,
      VERIFICATION_STATUS.APPROVED,
      null,
    );

    if (!updated) throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.ADMIN.VERIFICATION_APPROVED_FAILED);

    return TrainerMapper.toApproveDto(updated);
  }

  async rejectTrainer(profileId: string, reason: string): Promise<RejectTrainerResponseDto> {
    if (!reason?.trim()) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.REQUIRED_FIELD);
    }

    const profile = await this._trainerProfileRepo.findById(profileId);
    if (!profile) throw new AppError(STATUS.NOT_FOUND, MESSAGES.ADMIN.TRAINER_PROFILE_NOT_FOUND);

    const updated = await this._trainerProfileRepo.updateVerificationStatus(
      profileId,
      VERIFICATION_STATUS.REJECTED,
      reason,
    );

    if (!updated) throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.ADMIN.TRAINER_FAILED_TO_REJECTED);

    return TrainerMapper.toRejectDto(updated);
  }

  //  Workouts
  async workoutAdd(body: AddWorkoutDto): Promise<AddWorkoutResponseDto> {
    const imageUrl = await this._s3Service.uploadFile(body.file, "workouts");
    const workout: Workout = {
      id: "",
      workoutName: body.workoutName,
      workoutDescription: body.workoutDescription,
      workoutImage: imageUrl,
      isActive: true,
    };
    const saved = await this._workoutRepo.createWorkout(workout);
    return WorkoutMapper.toAdminResponse(saved);
  }

  async fetchWorkouts(): Promise<AddWorkoutResponseDto[]> {
    const workouts = await this._workoutRepo.getAllWorkouts();
    return WorkoutMapper.toAdminResponseList(workouts);
  }

  //  Subscriptions
  async createSubscription(data: CreateSubscriptionDTO): Promise<SubscriptionResponseDTO> {
    const domain = SubscriptionMapper.fromCreateDTO(data);
    const saved = await this._subscriptionRepo.createSubscription(domain);
    return SubscriptionMapper.toResponse(saved);
  }

  async getAllSubscriptions(): Promise<SubscriptionResponseDTO[]> {
    const subs = await this._subscriptionRepo.findAllSubscriptions();
    return subs.map(SubscriptionMapper.toResponse);
  }

  async getSubscriptionById(id: string): Promise<SubscriptionResponseDTO> {
    const sub = await this._subscriptionRepo.findSubscriptionById(id);
    if (!sub) throw new AppError(STATUS.NOT_FOUND, MESSAGES.SUBSCRIPTION.NOT_FOUND);
    return SubscriptionMapper.toResponse(sub);
  }

  async updateSubscription(
    id: string,
    data: UpdateSubscriptionDTO,
  ): Promise<SubscriptionResponseDTO> {
    const exists = await this._subscriptionRepo.findSubscriptionById(id);
    if (!exists) throw new AppError(STATUS.NOT_FOUND, MESSAGES.SUBSCRIPTION.NOT_FOUND);

    const updated = await this._subscriptionRepo.updateSubscription(
      id,
      SubscriptionMapper.fromUpdateDTO(data),
    );
    if (!updated) throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.SUBSCRIPTION.UPDATE_FAILED);

    return SubscriptionMapper.toResponse(updated);
  }

  async toggleSubscriptionStatus(id: string): Promise<SubscriptionResponseDTO> {
    const exists = await this._subscriptionRepo.findSubscriptionById(id);
    if (!exists) throw new AppError(STATUS.NOT_FOUND, MESSAGES.SUBSCRIPTION.NOT_FOUND);

    const updated = await this._subscriptionRepo.setSubscriptionStatus(id, !exists.isActive);
    if (!updated) throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.SUBSCRIPTION.UPDATE_FAILED);

    return SubscriptionMapper.toResponse(updated);
  }
}