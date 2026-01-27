import { file } from "zod";
import { STATUS } from "../../constants/statuscode";
import { AddWorkoutDto, AddWorkoutResponseDto, AdminGetTrainersDto, AdminGetTrainersResponseDto, AdminGetUsersDto, AdminGetUsersResponseDto } from "../../dto/admin/admin.dto";
import { AdminServiceInterface } from "../../interfaces/admin/admin-service.interface";
import { AdminAccountMapper, TrainerMapper, WorkoutMapper } from "../../mappers/admin/admin.mappers";

import AdminRepository from "../../repositories/admin/admin.repository";
import { AppError } from "../../utils/appError";
import { Workout } from "../../interfaces/admin/admin.interface";
import { S3Service } from "../s3/s3.service";
import { ApproveTrainerResponseDto, GetTrainerAppointmentsResponseDto, GetTrainerByIdResponseDto, RejectTrainerResponseDto } from "../../dto/trainer/trainer.dto";
import { VERIFICATION_STATUS } from "../../constants/verification.constants";


export class AdminService implements AdminServiceInterface {
  constructor(
    private adminRepo: AdminRepository,
    private s3Service: S3Service,
  ) { }

  async fetchUsers(
    query: AdminGetUsersDto
  ): Promise<AdminGetUsersResponseDto[]> {
    const users = await this.adminRepo.findUsers(query);

    return AdminAccountMapper.toResponseList(users);
  }

  async blockUser(userId: string): Promise<void> {
    if (!userId) {
      throw new AppError(STATUS.BAD_REQUEST, "User ID required");
    }

    await this.adminRepo.updateUserStatus(userId, true);
  }

  async unblockUser(userId: string): Promise<void> {
    if (!userId) {
      throw new AppError(STATUS.BAD_REQUEST, "User ID required");
    }

    await this.adminRepo.updateUserStatus(userId, false);
  }

  async fetchTrainers(query: AdminGetTrainersDto): Promise<AdminGetTrainersResponseDto[]> {
    const trainer = await this.adminRepo.findTrainers(query)
    return AdminAccountMapper.toResponseList(trainer);
  }


  async blockTrainer(trainerId: string): Promise<void> {
    if (!trainerId) {
      throw new AppError(STATUS.BAD_REQUEST, "Trainer ID required");
    }

    await this.adminRepo.updateTrainerStatus(trainerId, true);
  }

  async unblockTrainer(trainerId: string): Promise<void> {
    if (!trainerId) {
      throw new AppError(STATUS.BAD_REQUEST, "Trainer ID required");
    }

    await this.adminRepo.updateTrainerStatus(trainerId, false);
  }

  //workouts


  async workoutAdd(body: AddWorkoutDto): Promise<AddWorkoutResponseDto> {
    const imageUrl = await this.s3Service.uploadFile(
      body.file,
      "workouts"
    );

    const workout: Workout = {
      workoutName: body.workoutName,
      workoutDescription: body.workoutDescription,
      workoutImage: imageUrl,
      isActive: true,
    };

    const savedWorkout = await this.adminRepo.createWorkout(workout);

    return WorkoutMapper.toResponse(savedWorkout);
  }

   async fetchWorkouts(): Promise<Workout[]> {
    return this.adminRepo.getAllWorkouts();
  }


async getTrainerAppointments(): Promise<GetTrainerAppointmentsResponseDto[]> {
    try {
      const trainers = await this.adminRepo.getAllTrainersWithProfiles();
      return TrainerMapper.toDtoArray(trainers);
    } catch (error) {
      console.error("Error in getTrainerAppointments:", error);
      throw new AppError(500,"Failed to fetch trainer appointments");
    }
  }

  async getTrainerByProfileId(profileId: string): Promise<GetTrainerByIdResponseDto> {
  try {
    const trainer = await this.adminRepo.getTrainerByProfileId(profileId); 

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
      const profile = await this.adminRepo.findTrainerProfileById(profileId);
      if (!profile) {
        throw new AppError(404,"Trainer profile not found");
      }

      if (profile.verificationStatus === VERIFICATION_STATUS.APPROVED) {
        throw new AppError(404,"Trainer is already approved");
      }

      const updatedProfile = await this.adminRepo.updateTrainerVerificationStatus(
        profileId,
        VERIFICATION_STATUS.APPROVED,
        null
      );

      if (!updatedProfile) {
        throw new AppError(500,"Failed to approve trainer");
      }

      return TrainerMapper.toApproveDto(updatedProfile);
    } catch (error) {
      console.error("Error in approveTrainer:", error);
      if (error instanceof AppError) throw error;
      throw new AppError(500,"Failed to approve trainer");
    }
  }

  async rejectTrainer(profileId: string, reason: string): Promise<RejectTrainerResponseDto> {
    try {
      if (!reason || reason.trim().length === 0) {
        throw new AppError(400,"Rejection reason is required");
      }

      const profile = await this.adminRepo.findTrainerProfileById(profileId);
      if (!profile) {
        throw new AppError(404,"Trainer profile not found");
      }

      const updatedProfile = await this.adminRepo.updateTrainerVerificationStatus(
        profileId,
        VERIFICATION_STATUS.REJECTED,
        reason
      );

      if (!updatedProfile) {
        throw new AppError(500,"Failed to reject trainer");
      }

      return TrainerMapper.toRejectDto(updatedProfile);
    } catch (error) {
      console.error("Error in rejectTrainer:", error);
      if (error instanceof AppError) throw error;
      throw new AppError(500,"Failed to reject trainer");
    }
  }

}
