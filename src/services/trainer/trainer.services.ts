import mongoose from "mongoose";
import { ITrainerService } from "../../interfaces/service-interface/trainer/trainer-service.interface";
import { IUserRepository } from "../../interfaces/repository-interface/user/user-repository.interface";
import { ITrainerProfileRepository } from "../../interfaces/repository-interface/trainer/trainer.profile-repository.interface";
import { IS3Service } from "../../interfaces/service-interface/s3/s3-service.interface";
import {
  FindTrainerResponseDto,
  TrainerProfileDto,
  TrainerStatusResponseDto,
  UpdateTrainerProfileDto,
} from "../../dto/trainer/trainer.dto";
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

    const certificateUrl = await this._s3Service.uploadFile(
      data.certificateFile,
      "trainer-certificates",
    );
    const profileImageUrl = await this._s3Service.uploadFile(
      data.profileImageFile,
      "trainer-profile-images",
    );
    const coverPhotoUrl = await this._s3Service.uploadFile(
      data.coverImageFile,
      "trainer-cover-photos",
    );

    await this._userRepo.updateProfile(userId, {
      profilePic: profileImageUrl,
      gender: data.gender,
      dateOfBirth: new Date(data.dateOfBirth),
    });

    if (existing?.verificationStatus === VERIFICATION_STATUS.REJECTED) {
      await this._trainerProfileRepo.updateToReapply(userId, {
        experienceInYears: data.experienceInYears,
        certifications: [certificateUrl],
        bio: data.bio,
        coverPhoto: coverPhotoUrl,
        specializations: data.specializationIds,
        gender: data.gender,
        dateOfBirth: new Date(data.dateOfBirth),
      });
      return;
    }

    await this._trainerProfileRepo.createProfile({
      userId: new mongoose.Types.ObjectId(userId),
      experienceInYears: data.experienceInYears,
      coverPhoto: coverPhotoUrl,
      certifications: [certificateUrl],
      bio: data.bio,
      gender: data.gender,
      dateOfBirth: new Date(data.dateOfBirth),
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
}
