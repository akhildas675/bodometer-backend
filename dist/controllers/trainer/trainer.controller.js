"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainerController = void 0;
const query_1 = require("../../utils/query");
const appError_1 = require("../../utils/appError");
const statuscode_1 = require("../../constants/statuscode");
const messages_1 = require("../../constants/messages");
const success_response_1 = require("../../utils/success.response");
class TrainerController {
    _trainerService;
    constructor(_trainerService) {
        this._trainerService = _trainerService;
    }
    getTrainer = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new appError_1.AppError(statuscode_1.STATUS.UNAUTHORIZED, messages_1.MESSAGES.TOKEN.AUTHENTICATION_REQUIRED);
            }
            const trainerId = req.user.id;
            const trainer = await this._trainerService.fetchTrainer(trainerId);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.TRAINER.PROFILE_FETCHED, trainer).send(res);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                next(new Error("Unknown error occurred"));
            }
        }
    };
    updateProfile = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new appError_1.AppError(statuscode_1.STATUS.UNAUTHORIZED, messages_1.MESSAGES.TOKEN.AUTHENTICATION_REQUIRED);
            }
            const trainerId = req.user.id;
            const updateData = req.body;
            const updatedTrainer = await this._trainerService.updateTrainerProfile(trainerId, updateData);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.TRAINER.PROFILE_UPDATED, updatedTrainer).send(res);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                next(new Error("Unknown error occurred"));
            }
        }
    };
    uploadProfilePicture = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new appError_1.AppError(statuscode_1.STATUS.UNAUTHORIZED, messages_1.MESSAGES.TOKEN.AUTHENTICATION_REQUIRED);
            }
            if (!req.file) {
                throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.FILE.FILE_REQUIRED);
            }
            const trainerId = req.user.id;
            const file = req.file;
            const profilePicUrl = await this._trainerService.uploadTrainerProfilePicture(trainerId, file);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.USER.PROFILE_IMAGE_UPLOADED, { url: profilePicUrl }).send(res);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                next(new Error("Unknown error occurred"));
            }
        }
    };
    uploadDocument = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new appError_1.AppError(statuscode_1.STATUS.UNAUTHORIZED, messages_1.MESSAGES.TOKEN.AUTHENTICATION_REQUIRED);
            }
            if (!req.file) {
                throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.FILE.FILE_REQUIRED);
            }
            const file = req.file;
            const documentUrl = await this._trainerService.uploadTrainerDocument(file);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.FILE.UPLOAD_SUCCESS, { url: documentUrl }).send(res);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                next(new Error("Unknown error occurred"));
            }
        }
    };
    //Trainer profile
    createProfile = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new appError_1.AppError(statuscode_1.STATUS.UNAUTHORIZED, messages_1.MESSAGES.USER.USER_NOT_FOUND);
            }
            const body = req.body;
            const files = req.files;
            const profileImageFile = files?.profileImage?.[0];
            const certificateFile = files?.certificate?.[0];
            const coverImageFile = files?.coverImage?.[0];
            const data = {
                profileImageFile,
                certificateFile,
                coverImageFile,
                dateOfBirth: body.dateOfBirth || "",
                gender: body.gender || "prefer_not_say",
                experienceInYears: body.experience || 0,
                bio: body.bio || "",
                specializationIds: Array.isArray(body.specializationIds)
                    ? body.specializationIds
                    : body.specializationIds
                        ? [body.specializationIds]
                        : [],
            };
            await this._trainerService.createProfile(req.user.id, data);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.CREATED, messages_1.MESSAGES.TRAINER.PROFILE_CREATED).send(res);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                next(new Error("Unknown error occurred"));
            }
        }
    };
    getProfileStatus = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new appError_1.AppError(statuscode_1.STATUS.UNAUTHORIZED, messages_1.MESSAGES.USER.USER_NOT_FOUND);
            }
            const userId = req.user.id;
            const profileStatus = await this._trainerService.getTrainerStatus(userId);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.TRAINER.STATUS_FETCHED, profileStatus).send(res);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                next(new Error("Unknown error occurred"));
            }
        }
    };
    getCategories = async (req, res, next) => {
        try {
            const query = (0, query_1.parsePaginationQuery)(req);
            const result = await this._trainerService.getCategories(query);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.COMMON.SUCCESS, result.data, result.pagination).send(res);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                next(new Error("Unknown error occurred"));
            }
        }
    };
}
exports.TrainerController = TrainerController;
