"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const logger_1 = require("../../utils/logger");
const query_1 = require("../../utils/query");
const appError_1 = require("../../utils/appError");
const statuscode_1 = require("../../constants/statuscode");
const messages_1 = require("../../constants/messages");
const success_response_1 = require("../../utils/success.response");
class UserController {
    _userService;
    logger = new logger_1.Logger("UserController");
    constructor(_userService) {
        this._userService = _userService;
    }
    getUser = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new appError_1.AppError(statuscode_1.STATUS.UNAUTHORIZED, messages_1.MESSAGES.USER.USER_NOT_FOUND);
            }
            const userId = req.user.id;
            const user = await this._userService.fetchUser(userId);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.USER.PROFILE_FETCHED, user).send(res);
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
                throw new appError_1.AppError(statuscode_1.STATUS.UNAUTHORIZED, messages_1.MESSAGES.USER.USER_NOT_FOUND);
            }
            const userId = req.user.id;
            const updateData = req.body;
            const updatedUser = await this._userService.updateProfile(userId, updateData);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.USER.PROFILE_UPDATED, updatedUser).send(res);
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
                throw new appError_1.AppError(statuscode_1.STATUS.UNAUTHORIZED, messages_1.MESSAGES.USER.USER_NOT_FOUND);
            }
            if (!req.file) {
                throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.VALIDATION.REQUIRED_FIELD);
            }
            const userId = req.user.id;
            const file = req.file;
            const profilePicUrl = await this._userService.uploadProfilePicture(userId, file);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.USER.PROFILE_PICTURE_UPDATED, { url: profilePicUrl }).send(res);
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
    changePassword = async (req, res, next) => {
        try {
            if (!req.user)
                throw new appError_1.AppError(statuscode_1.STATUS.UNAUTHORIZED, messages_1.MESSAGES.USER.USER_NOT_FOUND);
            const body = req.body;
            console.log("old password...", body);
            const dto = {
                currentPassword: body.currentPassword || "",
                newPassword: body.newPassword || "",
            };
            await this._userService.changePassword(req.user.id, dto);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.PASSWORD.CHANGED_SUCCESS).send(res);
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
    getTrainers = async (req, res, next) => {
        try {
            const query = {
                ...(0, query_1.parsePaginationQuery)(req),
                ...(typeof req.query.specializationId === "string" && { specializationId: req.query.specializationId }),
            };
            const result = await this._userService.getTrainers(query);
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
    getTrainerById = async (req, res, next) => {
        try {
            const { id } = req.params;
            if (!id) {
                throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.VALIDATION.ID_REQUIRED);
            }
            const result = await this._userService.getTrainerById(id);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.COMMON.SUCCESS, result).send(res);
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
            const result = await this._userService.getCategories(query);
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
    getAllEquipment = async (req, res, next) => {
        try {
            const query = (0, query_1.parsePaginationQuery)(req);
            const result = await this._userService.getAllEquipment(query);
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
    getCategoryById = async (req, res, next) => {
        try {
            const { categoryId } = req.params;
            if (!categoryId) {
                throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.VALIDATION.ID_REQUIRED);
            }
            const result = await this._userService.getCategoryById(categoryId);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.COMMON.SUCCESS, result).send(res);
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
    getMySubscriptions = async (req, res, next) => {
        try {
            if (!req.user?.id) {
                throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.USER.USER_NOT_FOUND);
            }
            const result = await this._userService.getMySubscriptions();
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.COMMON.SUCCESS, result).send(res);
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
    createCheckoutSession = async (req, res, next) => {
        try {
            if (!req.user?.id) {
                throw new appError_1.AppError(statuscode_1.STATUS.UNAUTHORIZED, messages_1.MESSAGES.USER.USER_NOT_FOUND);
            }
            const body = req.body;
            const planId = body.planId;
            if (!planId) {
                throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.VALIDATION.ID_REQUIRED);
            }
            const result = await this._userService.createCheckoutSession(req.user.id, planId);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.COMMON.SUCCESS, result).send(res);
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
    verifyPayment = async (req, res, next) => {
        try {
            const { session_id } = req.query;
            if (!session_id || typeof session_id !== "string") {
                throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.VALIDATION.SESSION_ID_REQUIRED);
            }
            const result = await this._userService.verifyPaymentAndSave(req.user.id, session_id);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.USER.PAYMENT_VERIFIED, result).send(res);
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
    getActiveSubscription = async (req, res, next) => {
        try {
            if (!req.user?.id) {
                throw new appError_1.AppError(statuscode_1.STATUS.UNAUTHORIZED, messages_1.MESSAGES.USER.USER_NOT_FOUND);
            }
            const result = await this._userService.getActiveSubscription(req.user.id);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.COMMON.SUCCESS, result).send(res);
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
    getOnboardingGroups = async (req, res, next) => {
        try {
            const result = await this._userService.getOnboardingGroups();
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
    getOnboardingQuestions = async (req, res, next) => {
        try {
            const result = await this._userService.getOnboardingQuestions();
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
    submitOnboarding = async (req, res, next) => {
        try {
            if (!req.user?.id) {
                throw new appError_1.AppError(statuscode_1.STATUS.UNAUTHORIZED, messages_1.MESSAGES.USER.USER_NOT_FOUND);
            }
            await this._userService.submitOnboarding(req.user.id, req.body);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.USER.ONBOARDING_SAVED).send(res);
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
    getOnboardingStatus = async (req, res, next) => {
        try {
            if (!req.user?.id) {
                throw new appError_1.AppError(statuscode_1.STATUS.UNAUTHORIZED, messages_1.MESSAGES.USER.USER_NOT_FOUND);
            }
            const result = await this._userService.getOnboardingStatus(req.user.id);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.COMMON.SUCCESS, result).send(res);
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
    getOnboardingAnswers = async (req, res, next) => {
        try {
            if (!req.user?.id) {
                throw new appError_1.AppError(statuscode_1.STATUS.UNAUTHORIZED, messages_1.MESSAGES.USER.USER_NOT_FOUND);
            }
            const result = await this._userService.getOnboardingAnswers(req.user.id);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.COMMON.SUCCESS, result).send(res);
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
    getUserTransactions = async (req, res, next) => {
        try {
            if (!req.user?.id) {
                throw new appError_1.AppError(statuscode_1.STATUS.UNAUTHORIZED, messages_1.MESSAGES.USER.USER_NOT_FOUND);
            }
            const parsed = (0, query_1.parsePaginationQuery)(req);
            const status = typeof req.query.status === "string" ? req.query.status : undefined;
            const result = await this._userService.getUserTransactions(req.user.id, parsed.search, parsed.sortBy, parsed.sortOrder, parsed.page, parsed.limit, status);
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
    calculateBmiPublic = async (req, res, next) => {
        try {
            const data = req.body;
            const result = await this._userService.calculateBmi(data);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.USER.BMI_CALCULATED, result).send(res);
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
    getExercises = async (req, res, next) => {
        try {
            const { search, difficulty, targetMuscleId, categoryId, page, limit } = req.query;
            const query = {
                search: search,
                difficulty: difficulty,
                targetMuscleId: targetMuscleId,
                categoryId: categoryId,
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
            };
            const result = await this._userService.getExercises(query);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.EXERCISE.LIST_FETCHED, result.data, result.pagination).send(res);
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
    getExerciseById = async (req, res, next) => {
        try {
            const { exerciseId } = req.params;
            if (!exerciseId) {
                throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.VALIDATION.ID_REQUIRED);
            }
            const exercise = await this._userService.getExerciseById(exerciseId);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.EXERCISE.FETCHED, exercise).send(res);
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
exports.UserController = UserController;
