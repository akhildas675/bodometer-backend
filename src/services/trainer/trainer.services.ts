import { STATUS } from "@/constants/statuscode";
import { MESSAGES } from "@/constants/messages";
import { VERIFICATION_STATUS } from "@/constants/verification.constants";
import {
  FindTrainerResponseDto,
  TrainerProfileDto,
  TrainerStatusResponseDto,
  UpdateTrainerProfileDto,
} from "@/dto/trainer/trainer.dto";
import { IS3Service } from "@/interfaces/s3/s3-service.interface";
import { ITrainerProfileRepository } from "@/interfaces/trainer/trainer.profile-repository.interface";
import { ITrainerService } from "@/interfaces/trainer/trainer-service.interface";
import { IUserRepository } from "@/interfaces/user/user-repository.interface";
import { IWorkoutRepository } from "@/interfaces/workout/workout-repository.interface";

import { TrainerWorkoutList } from "@/interfaces/trainer/trainer.interface";
import { AppError } from "@/utils/appError";
import { TrainerMapper } from "@/mappers/trainer/trainer.mapper";
import mongoose from "mongoose";

export class TrainerService implements ITrainerService {
  constructor(
    private _userRepo: IUserRepository,
    private _trainerProfileRepo: ITrainerProfileRepository,
    private _workoutRepo: IWorkoutRepository,
    private _s3Service: IS3Service,
  ) { }

  //Profile 
  async fetchTrainer(trainerId: string): Promise<FindTrainerResponseDto> {
    const trainer = await this._userRepo.findById(trainerId);
    if (!trainer) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.TRAINER.NOT_FOUND);
    }
    return TrainerMapper.toProfileResponse(trainer);
  }

  async updateTrainerProfile(
    trainerId: string,
    updateData: UpdateTrainerProfileDto,
  ): Promise<FindTrainerResponseDto> {
    if (Object.keys(updateData).length === 0) {
      throw new AppError(STATUS.BAD_REQUEST, "No fields to update");
    }

    if (updateData.gender && updateData.gender === "prefer_not_say") {
      throw new AppError(STATUS.BAD_REQUEST, "Please select a valid gender");
    }

    if (!updateData.dateOfBirth) {
      throw new AppError(STATUS.BAD_REQUEST, "Please select the date of birth");
    }

    const dob = new Date(updateData.dateOfBirth);
    const today = new Date();
    const limitDate = new Date(
      today.getFullYear() - 15,
      today.getMonth(),
      today.getDate(),
    );

    if (dob > limitDate) {
      throw new AppError(STATUS.BAD_REQUEST, "You must be at least 15 years old");
    }

    const updatedUser = await this._userRepo.updateProfile(trainerId, updateData);
    if (!updatedUser) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.TRAINER.NOT_FOUND);
    }

    return TrainerMapper.toProfileResponse(updatedUser);
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
      } catch (error) {
        console.error("Error deleting old profile picture:", error);
      }
    }

    const profilePicUrl = await this._s3Service.uploadFile(
      file,
      `profile-pictures/${trainerId}`,
    );

    await this._userRepo.updateProfile(trainerId, { profilePic: profilePicUrl });

    return profilePicUrl;
  }

  // Trainer Application 
  async createProfile(userId: string, data: TrainerProfileDto): Promise<void> {
    const existing = await this._trainerProfileRepo.findByUserId(userId);

    if (existing?.verificationStatus === VERIFICATION_STATUS.PENDING) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.TRAINER.TRAINER_PROFILE_EXISTS);
    }
    if (existing?.verificationStatus === VERIFICATION_STATUS.APPROVED) {
      throw new AppError(STATUS.BAD_REQUEST, "Your profile is already approved");
    }
    if (existing?.verificationStatus === VERIFICATION_STATUS.REJECTED && existing.applyCount >= 2) {
      throw new AppError(STATUS.FORBIDDEN, "You have reached the maximum number of applications.");
    }

    const certificateUrl = await this._s3Service.uploadFile(data.certificateFile, "trainer-certificates");
    const profileImageUrl = await this._s3Service.uploadFile(data.profileImageFile, "trainer-profile-images");

    await this._userRepo.updateProfile(userId, {
      profilePic: profileImageUrl,
      gender: data.gender,
      dateOfBirth: new Date(data.dateOfBirth),
    });

    const specializationObjectIds = data.specializationIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    if (existing?.verificationStatus === VERIFICATION_STATUS.REJECTED) {
      await this._trainerProfileRepo.updateToReapply(userId, {
        experienceInYears: data.experienceInYears,
        certifications: [certificateUrl],
        bio: data.bio,
        specializationIds: specializationObjectIds,
      });
      return;
    }

    await this._trainerProfileRepo.createProfile({
      userId: new mongoose.Types.ObjectId(userId),
      specializationIds: specializationObjectIds, 
      experienceInYears: data.experienceInYears,
      certifications: [certificateUrl],
      bio: data.bio,
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
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.TRAINER.TRAINERS_FETCHED_FAILED);
    }

    return response;
  }

  //  Workout
  async fetchWorkoutList(): Promise<TrainerWorkoutList[]> {
    return this._workoutRepo.getWorkoutNameList();
  }
}