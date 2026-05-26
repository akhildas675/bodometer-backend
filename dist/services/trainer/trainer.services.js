"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainerService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const appError_1 = require("../../utils/appError");
const statuscode_1 = require("../../constants/statuscode");
const messages_1 = require("../../constants/messages");
const trainer_mapper_1 = require("../../mappers/trainer/trainer.mapper");
const verification_constants_1 = require("../../constants/verification.constants");
class TrainerService {
    _userRepo;
    _trainerProfileRepo;
    _s3Service;
    _categoryRepo;
    constructor(_userRepo, _trainerProfileRepo, _s3Service, _categoryRepo) {
        this._userRepo = _userRepo;
        this._trainerProfileRepo = _trainerProfileRepo;
        this._s3Service = _s3Service;
        this._categoryRepo = _categoryRepo;
    }
    //Profile
    async fetchTrainer(trainerId) {
        const trainer = await this._userRepo.findById(trainerId);
        if (!trainer) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.TRAINER.NOT_FOUND);
        }
        const profile = await this._trainerProfileRepo.findByUserId(trainerId);
        return trainer_mapper_1.TrainerMapper.toProfileResponse(trainer, profile);
    }
    async updateTrainerProfile(trainerId, updateData) {
        if (Object.keys(updateData).length === 0) {
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.VALIDATION.NO_FIELDS_TO_UPDATE);
        }
        if (!updateData.dateOfBirth) {
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.COMMON.SELECT_CORRECT_DOB);
        }
        const dob = new Date(updateData.dateOfBirth);
        const today = new Date();
        const limitDate = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());
        if (dob > limitDate) {
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.TRAINER.AGE_RESTRICTION);
        }
        const updatedUser = await this._userRepo.updateProfile(trainerId, updateData);
        if (!updatedUser) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.TRAINER.NOT_FOUND);
        }
        const profileFields = {};
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
            profileFields.specializations = updateData.specializations.map((id) => new mongoose_1.default.Types.ObjectId(id));
        }
        if (Object.keys(profileFields).length > 0) {
            await this._trainerProfileRepo.upsert({ userId: trainerId }, profileFields);
        }
        const profile = await this._trainerProfileRepo.findByUserId(trainerId);
        return trainer_mapper_1.TrainerMapper.toProfileResponse(updatedUser, profile);
    }
    async uploadTrainerProfilePicture(trainerId, file) {
        const trainer = await this._userRepo.findById(trainerId);
        if (!trainer) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.TRAINER.NOT_FOUND);
        }
        if (trainer.profilePic) {
            try {
                await this._s3Service.deleteFile(trainer.profilePic);
            }
            catch {
                throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.USER.PROFILE_PICTURE_DELETE_FAILED);
            }
        }
        const profilePicUrl = await this._s3Service.uploadFile(file, `profile-pictures/${trainerId}`);
        await this._userRepo.updateProfile(trainerId, {
            profilePic: profilePicUrl,
        });
        return profilePicUrl;
    }
    async uploadTrainerDocument(file) {
        const documentUrl = await this._s3Service.uploadFile(file, "trainer-certificates");
        return documentUrl;
    }
    // Trainer Application
    async createProfile(userId, data) {
        const existing = await this._trainerProfileRepo.findByUserId(userId);
        if (existing?.verificationStatus === verification_constants_1.VERIFICATION_STATUS.PENDING) {
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.TRAINER.TRAINER_PROFILE_EXISTS);
        }
        if (existing?.verificationStatus === verification_constants_1.VERIFICATION_STATUS.APPROVED) {
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.ADMIN.VERIFICATION_APPROVED_EXISTS);
        }
        if (existing?.verificationStatus === verification_constants_1.VERIFICATION_STATUS.REJECTED &&
            existing.applyCount >= 2) {
            throw new appError_1.AppError(statuscode_1.STATUS.FORBIDDEN, messages_1.MESSAGES.TRAINER.MAX_APPLICATIONS_REACHED);
        }
        let certificateUrl = "";
        if (data.certificateFile) {
            certificateUrl = await this._s3Service.uploadFile(data.certificateFile, "trainer-certificates");
        }
        let profileImageUrl = "";
        if (data.profileImageFile) {
            profileImageUrl = await this._s3Service.uploadFile(data.profileImageFile, "trainer-profile-images");
        }
        let coverPhotoUrl = "";
        if (data.coverImageFile) {
            coverPhotoUrl = await this._s3Service.uploadFile(data.coverImageFile, "trainer-cover-photos");
        }
        const userUpdateFields = {
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
        if (existing?.verificationStatus === verification_constants_1.VERIFICATION_STATUS.REJECTED) {
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
            userId: new mongoose_1.default.Types.ObjectId(userId),
            experienceInYears: data.experienceInYears,
            coverPhoto,
            certifications,
            bio: data.bio,
            gender: data.gender,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
            specializations: data.specializationIds.map((id) => new mongoose_1.default.Types.ObjectId(id)),
            verificationStatus: verification_constants_1.VERIFICATION_STATUS.PENDING,
            rejectionReason: null,
            applyCount: 1,
        });
    }
    async getTrainerStatus(userId) {
        if (!userId) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.TRAINER.NOT_FOUND);
        }
        const response = await this._trainerProfileRepo.fetchTrainerStatus(userId);
        if (!response) {
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.TRAINER.TRAINERS_FETCHED_FAILED);
        }
        return response;
    }
    async getCategories(query) {
        return this._categoryRepo.getAllCategories({
            ...query,
            isActive: true,
        });
    }
}
exports.TrainerService = TrainerService;
