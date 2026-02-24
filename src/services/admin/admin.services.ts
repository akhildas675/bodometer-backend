import { STATUS } from "../../constants/statuscode";
import {
  AddWorkoutDto,
  AddWorkoutResponseDto,
  AdminGetTrainersDto,
  AdminGetTrainersResponseDto,
  AdminGetUsersDto,
  AdminGetUsersResponseDto,
  PaginatedResponseDto,
} from "../../dto/admin/admin.dto";
import { IAdminService } from "../../interfaces/admin/admin-service.interface";
import {
  AdminAccountMapper,
  TrainerMapper,
  WorkoutMapper,
} from "../../mappers/admin/admin.mappers";
import { AppError } from "../../utils/appError";
import { PaginatedResult, Workout } from "../../interfaces/admin/admin.interface";
import {
  ApproveTrainerResponseDto,
  GetTrainerAppointmentsResponseDto,
  GetTrainerByIdResponseDto,
  RejectTrainerResponseDto,
} from "../../dto/trainer/trainer.dto";
import { VERIFICATION_STATUS } from "../../constants/verification.constants";
import { IAdminRepository } from "../../interfaces/admin/admin-repository.interface";
import { IS3Service } from "../../interfaces/s3/s3-service.interface";
import { MESSAGES } from "../../constants/messages";

export class AdminService implements IAdminService {
  constructor(
    private _adminRepo: IAdminRepository,
    private _s3Service: IS3Service
  ) { }

  async fetchUsers(
    query: AdminGetUsersDto,
  ): Promise<PaginatedResponseDto<AdminGetUsersResponseDto>> {
    const { users, total } = await this._adminRepo.findUsers(query);

    const page = query.page || 1;
    const limit = query.limit || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      data: AdminAccountMapper.toResponseList(users),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },

    }
  }

  async blockUser(userId: string): Promise<void> {
    if (!userId) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
    }

    await this._adminRepo.updateUserStatus(userId, true);
  }

  async unblockUser(userId: string): Promise<void> {
    if (!userId) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
    }

    await this._adminRepo.updateUserStatus(userId, false);
  }

  async fetchTrainers(
    query: AdminGetTrainersDto,
  ): Promise<PaginatedResponseDto<AdminGetTrainersResponseDto>> {
    const { trainers, total } = await this._adminRepo.findTrainers(query);

    const page = query.page || 1;
    const limit = query.limit || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      data: AdminAccountMapper.toResponseList(trainers),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async blockTrainer(trainerId: string): Promise<void> {
    if (!trainerId) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
    }

    await this._adminRepo.updateTrainerStatus(trainerId, true);
  }

  async unblockTrainer(trainerId: string): Promise<void> {
    if (!trainerId) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
    }

    await this._adminRepo.updateTrainerStatus(trainerId, false);
  }

  //workouts

  async workoutAdd(body: AddWorkoutDto): Promise<AddWorkoutResponseDto> {
    const imageUrl = await this._s3Service.uploadFile(body.file, "workouts");

    const workout: Workout = {
      workoutName: body.workoutName,
      workoutDescription: body.workoutDescription,
      workoutImage: imageUrl,
      isActive: true,
    };

    const savedWorkout = await this._adminRepo.createWorkout(workout);

    return WorkoutMapper.toResponse(savedWorkout);
  }

  async fetchWorkouts(): Promise<Workout[]> {
    return this._adminRepo.getAllWorkouts();
  }

async getTrainerAppointments(
  search?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  page?: number,
  limit?: number,
  status?: string
): Promise<PaginatedResult<GetTrainerAppointmentsResponseDto>> {
  try {
    const { data, pagination } = await this._adminRepo.getAllTrainersWithProfiles(
      search,
      sortBy,
      sortOrder,
      page,
      limit,
      status
    );
    return {
      data: TrainerMapper.toDtoArray(data),
      pagination,
    };
  } catch (error) {
    console.error('Error in getTrainerAppointments:', error);
    throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.ADMIN.APPOINTMENTS_FETCHED_FAILED);
  }
}

  async getTrainerByProfileId(
    profileId: string,
  ): Promise<GetTrainerByIdResponseDto> {
    try {
      const trainer = await this._adminRepo.getTrainerByProfileId(profileId);

      if (!trainer) {
        throw new AppError(STATUS.NOT_FOUND, MESSAGES.TRAINER.NOT_FOUND);
      }

      return TrainerMapper.toDetailDto(trainer);
    } catch (error) {
      console.error("Error in getTrainerByProfileId:", error);
      if (error instanceof AppError) throw error;
      throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.ADMIN.TRAINER_PROFILE_FETCHED_FAILED);
    }
  }

  async approveTrainer(profileId: string): Promise<ApproveTrainerResponseDto> {
    try {
      const profile = await this._adminRepo.findTrainerProfileById(profileId);
      if (!profile) {
        throw new AppError(STATUS.NOT_FOUND, MESSAGES.ADMIN.TRAINER_PROFILE_FETCHED_FAILED);
      }

      if (profile.verificationStatus === VERIFICATION_STATUS.APPROVED) {
        throw new AppError(STATUS.NOT_FOUND, MESSAGES.ADMIN.VERIFICATION_APPROVED_EXISTS);
      }

      const updatedProfile =
        await this._adminRepo.updateTrainerVerificationStatus(
          profileId,
          VERIFICATION_STATUS.APPROVED,
          null,
        );

      if (!updatedProfile) {
        throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.ADMIN.VERIFICATION_APPROVED_FAILED);
      }

      return TrainerMapper.toApproveDto(updatedProfile);
    } catch (error) {
      console.error("Error in approveTrainer:", error);
      if (error instanceof AppError) throw error;
      throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.ADMIN.VERIFICATION_APPROVED_FAILED);
    }
  }

  async rejectTrainer(
    profileId: string,
    reason: string,
  ): Promise<RejectTrainerResponseDto> {
    try {
      if (!reason || reason.trim().length === 0) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.REQUIRED_FIELD);
      }

      const profile = await this._adminRepo.findTrainerProfileById(profileId);
      if (!profile) {
        throw new AppError(STATUS.NOT_FOUND, MESSAGES.ADMIN.TRAINER_PROFILE_NOT_FOUND);
      }

      const updatedProfile =
        await this._adminRepo.updateTrainerVerificationStatus(
          profileId,
          VERIFICATION_STATUS.REJECTED,
          reason,
        );

      if (!updatedProfile) {
        throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.ADMIN.TRAINER_FAILED_TO_REJECTED);
      }

      return TrainerMapper.toRejectDto(updatedProfile);
    } catch (error) {
      console.error("Error in rejectTrainer:", error);
      if (error instanceof AppError) throw error;
      throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.ADMIN.TRAINER_FAILED_TO_REJECTED);
    }
  }
}
