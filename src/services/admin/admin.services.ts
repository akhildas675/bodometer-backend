import { file } from "zod";
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

import AdminRepository from "../../repositories/admin/admin.repository";
import { AppError } from "../../utils/appError";
import { Workout } from "../../interfaces/admin/admin.interface";
import { S3Service } from "../s3/s3.service";
import {
  ApproveTrainerResponseDto,
  GetTrainerAppointmentsResponseDto,
  GetTrainerByIdResponseDto,
  RejectTrainerResponseDto,
} from "../../dto/trainer/trainer.dto";
import { VERIFICATION_STATUS } from "../../constants/verification.constants";
import { IAdminRepository } from "../../interfaces/admin/admin-repository.interface";
import { IS3Service } from "../../interfaces/s3/s3-service.interface";

export class AdminService implements IAdminService {
  constructor(
    private _adminRepo: IAdminRepository,
    private _s3Service: IS3Service
  ) { }

  async fetchUsers(
    query: AdminGetUsersDto,
  ): Promise<AdminGetUsersResponseDto[]> {
    const users = await this._adminRepo.findUsers(query);

    return AdminAccountMapper.toResponseList(users);
  }

  async blockUser(userId: string): Promise<void> {
    if (!userId) {
      throw new AppError(STATUS.BAD_REQUEST, "User ID required");
    }

    await this._adminRepo.updateUserStatus(userId, true);
  }

  async unblockUser(userId: string): Promise<void> {
    if (!userId) {
      throw new AppError(STATUS.BAD_REQUEST, "User ID required");
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
      throw new AppError(STATUS.BAD_REQUEST, "Trainer ID required");
    }

    await this._adminRepo.updateTrainerStatus(trainerId, true);
  }

  async unblockTrainer(trainerId: string): Promise<void> {
    if (!trainerId) {
      throw new AppError(STATUS.BAD_REQUEST, "Trainer ID required");
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

  async getTrainerAppointments(): Promise<GetTrainerAppointmentsResponseDto[]> {
    try {
      const trainers = await this._adminRepo.getAllTrainersWithProfiles();
      return TrainerMapper.toDtoArray(trainers);
    } catch (error) {
      console.error("Error in getTrainerAppointments:", error);
      throw new AppError(500, "Failed to fetch trainer appointments");
    }
  }

  async getTrainerByProfileId(
    profileId: string,
  ): Promise<GetTrainerByIdResponseDto> {
    try {
      const trainer = await this._adminRepo.getTrainerByProfileId(profileId);

      if (!trainer) {
        throw new AppError(404, "Trainer not found");
      }

      return TrainerMapper.toDetailDto(trainer);
    } catch (error) {
      console.error("Error in getTrainerByProfileId:", error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, "Failed to fetch trainer details");
    }
  }

  async approveTrainer(profileId: string): Promise<ApproveTrainerResponseDto> {
    try {
      const profile = await this._adminRepo.findTrainerProfileById(profileId);
      if (!profile) {
        throw new AppError(404, "Trainer profile not found");
      }

      if (profile.verificationStatus === VERIFICATION_STATUS.APPROVED) {
        throw new AppError(404, "Trainer is already approved");
      }

      const updatedProfile =
        await this._adminRepo.updateTrainerVerificationStatus(
          profileId,
          VERIFICATION_STATUS.APPROVED,
          null,
        );

      if (!updatedProfile) {
        throw new AppError(500, "Failed to approve trainer");
      }

      return TrainerMapper.toApproveDto(updatedProfile);
    } catch (error) {
      console.error("Error in approveTrainer:", error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, "Failed to approve trainer");
    }
  }

  async rejectTrainer(
    profileId: string,
    reason: string,
  ): Promise<RejectTrainerResponseDto> {
    try {
      if (!reason || reason.trim().length === 0) {
        throw new AppError(400, "Rejection reason is required");
      }

      const profile = await this._adminRepo.findTrainerProfileById(profileId);
      if (!profile) {
        throw new AppError(404, "Trainer profile not found");
      }

      const updatedProfile =
        await this._adminRepo.updateTrainerVerificationStatus(
          profileId,
          VERIFICATION_STATUS.REJECTED,
          reason,
        );

      if (!updatedProfile) {
        throw new AppError(500, "Failed to reject trainer");
      }

      return TrainerMapper.toRejectDto(updatedProfile);
    } catch (error) {
      console.error("Error in rejectTrainer:", error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, "Failed to reject trainer");
    }
  }
}
