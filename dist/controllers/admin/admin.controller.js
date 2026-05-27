"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const appError_1 = require("../../utils/appError");
const query_1 = require("../../utils/query");
const statuscode_1 = require("../../constants/statuscode");
const messages_1 = require("../../constants/messages");
const success_response_1 = require("../../utils/success.response");
class AdminController {
    _adminService;
    constructor(_adminService) {
        this._adminService = _adminService;
    }
    //Trainer
    getTrainers = async (req, res, next) => {
        try {
            const query = req.query;
            const data = await this._adminService.fetchTrainers(query);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.TRAINER.TRAINERS_FETCHED, data.data, data.pagination).send(res);
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
    blockTrainer = async (req, res, next) => {
        try {
            const { trainerId } = req.params;
            await this._adminService.blockTrainer(trainerId);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.ADMIN.TRAINER_BLOCKED).send(res);
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
    unblockTrainer = async (req, res, next) => {
        try {
            const { trainerId } = req.params;
            await this._adminService.unblockTrainer(trainerId);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.ADMIN.TRAINER_UNBLOCKED).send(res);
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
    //trainer appointment
    getTrainerAppointments = async (req, res, next) => {
        try {
            const query = {
                ...(0, query_1.parsePaginationQuery)(req),
                ...(req.query.status && { status: req.query.status }),
            };
            const result = await this._adminService.getTrainerAppointments(query);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.TRAINER.PROFILE_FETCHED, result.data, result.pagination).send(res);
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
            const { profileId } = req.params;
            if (!profileId) {
                throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.ADMIN.PROFILE_ID_REQUIRED);
            }
            const trainer = await this._adminService.getTrainerByProfileId(profileId);
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
    approveTrainer = async (req, res, next) => {
        try {
            const { profileId } = req.params;
            if (!profileId) {
                throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.ADMIN.PROFILE_ID_REQUIRED);
            }
            const result = await this._adminService.approveTrainer(profileId);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, result.message, result.profile).send(res);
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
    rejectTrainer = async (req, res, next) => {
        try {
            const { profileId } = req.params;
            const { reason } = req.body;
            if (!profileId) {
                throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.VALIDATION.INVALID_ID);
            }
            if (!reason) {
                throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.VALIDATION.REQUIRED_FIELD);
            }
            const result = await this._adminService.rejectTrainer(profileId, reason);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, result.message, result.profile).send(res);
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
    //User
    getUsers = async (req, res, next) => {
        try {
            const query = req.query;
            const data = await this._adminService.fetchUsers(query);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.USER.PROFILE_FETCHED, data.data, data.pagination).send(res);
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
    blockUser = async (req, res, next) => {
        try {
            const { userId } = req.params;
            await this._adminService.blockUser(userId);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.ADMIN.USER_BLOCKED).send(res);
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
    unblockUser = async (req, res, next) => {
        try {
            const { userId } = req.params;
            await this._adminService.unblockUser(userId);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.ADMIN.USER_UNBLOCKED).send(res);
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
    createCategory = async (req, res, next) => {
        try {
            const body = req.body;
            const data = {
                name: body.name?.trim() || "",
                description: body.description?.trim() || "",
                image: req.file,
            };
            await this._adminService.createCategory(data);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.CREATED, messages_1.MESSAGES.ADMIN.CATEGORY_CREATED).send(res);
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
    updateCategory = async (req, res, next) => {
        try {
            const body = req.body;
            const data = {
                categoryId: (req.params.categoryId || body.categoryId)?.trim() || "",
                name: body.name?.trim(),
                description: body.description?.trim(),
                image: req.file,
            };
            await this._adminService.updateCategory(data);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.CREATED, messages_1.MESSAGES.ADMIN.CATEGORY_UPDATED).send(res);
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
            const category = await this._adminService.getCategoryById(categoryId);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.ADMIN.CATEGORY_FETCHED, category).send(res);
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
    getAllCategories = async (req, res, next) => {
        try {
            const query = {
                search: "",
                page: 1,
                limit: 10,
                sortBy: "createdAt",
                sortOrder: "desc",
                ...(0, query_1.parsePaginationQuery)(req),
            };
            const { data, pagination } = await this._adminService.getAllCategories(query);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.ADMIN.CATEGORY_FETCHED, data, pagination).send(res);
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
    toggleCategoryStatus = async (req, res, next) => {
        try {
            const { categoryId } = req.params;
            const result = await this._adminService.toggleCategoryStatus(categoryId);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, result.message, result.category).send(res);
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
    getAllSubscriptionFeatures = async (req, res, next) => {
        try {
            const query = {
                search: "",
                page: 1,
                limit: 10,
                sortBy: "createdAt",
                sortOrder: "desc",
                ...(0, query_1.parsePaginationQuery)(req),
            };
            const { data, pagination } = await this._adminService.getAllSubscriptionFeatures(query);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.COMMON.SUCCESS, data, pagination).send(res);
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
    createSubscriptionFeature = async (req, res, next) => {
        try {
            const body = req.body;
            const data = {
                title: body.title?.trim() || "",
                description: body.description?.trim() || "",
                type: body.type || "boolean",
            };
            await this._adminService.createSubscriptionFeature(data);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.CREATED, messages_1.MESSAGES.ADMIN.SUBSCRIPTION_FEATURE_CREATED).send(res);
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
    updateSubscriptionFeature = async (req, res, next) => {
        try {
            const { id: subscriptionFeatureId } = req.params;
            const body = req.body;
            const data = {
                subscriptionFeatureId,
                title: body.title?.trim(),
                description: body.description?.trim(),
                type: body.type,
            };
            await this._adminService.updateSubscriptionFeature(data);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.ADMIN.SUBSCRIPTION_FEATURE_UPDATED).send(res);
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
    toggleSubscriptionFeatureStatus = async (req, res, next) => {
        try {
            const { id: subscriptionFeatureId } = req.params;
            const result = await this._adminService.toggleSubscriptionFeatureStatus(subscriptionFeatureId);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, result.message, result.feature).send(res);
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
    getSubscriptionFeatureById = async (req, res, next) => {
        try {
            const { id: subscriptionFeatureId } = req.params;
            const feature = await this._adminService.getSubscriptionFeatureById(subscriptionFeatureId);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.ADMIN.SUBSCRIPTION_FEATURE_FETCHED, feature).send(res);
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
    createSubscriptionPlan = async (req, res, next) => {
        try {
            const body = req.body;
            const data = {
                name: body.name?.trim() || "",
                description: body.description?.trim() || "",
                price: body.price ?? 0,
                durationInDays: body.durationInDays ?? 0,
                isPopular: body.isPopular ?? false,
                features: body.features ?? [],
            };
            await this._adminService.createSubscriptionPlan(data);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.CREATED, messages_1.MESSAGES.ADMIN.SUBSCRIPTION_PLAN_CREATED).send(res);
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
    getAllSubscriptionPlans = async (req, res, next) => {
        try {
            const query = {
                search: "",
                page: 1,
                limit: 10,
                sortBy: "createdAt",
                sortOrder: "desc",
                ...(0, query_1.parsePaginationQuery)(req),
            };
            const { data, pagination } = await this._adminService.getAllSubscriptionPlans(query);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.COMMON.SUCCESS, data, pagination).send(res);
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
    toggleSubscriptionPlanStatus = async (req, res, next) => {
        try {
            const { id: subscriptionPlanId } = req.params;
            const result = await this._adminService.toggleSubscriptionPlanStatus(subscriptionPlanId);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, result.message, result.plan).send(res);
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
    getSubscriptionPlanById = async (req, res, next) => {
        try {
            const { id: subscriptionPlanId } = req.params;
            const plan = await this._adminService.getSubscriptionPlanById(subscriptionPlanId);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.ADMIN.SUBSCRIPTION_PLAN_FETCHED, plan).send(res);
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
    updateSubscriptionPlan = async (req, res, next) => {
        try {
            const { id: subscriptionPlanId } = req.params;
            const body = req.body;
            const data = {
                subscriptionPlanId,
                name: body.name?.trim(),
                description: body.description?.trim(),
                price: body.price,
                durationInDays: body.durationInDays,
                isPopular: body.isPopular,
                features: body.features,
            };
            await this._adminService.updateSubscriptionPlan(data);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.ADMIN.SUBSCRIPTION_PLAN_UPDATED).send(res);
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
    // Question Groups
    getAllQuestionGroups = async (req, res, next) => {
        try {
            const query = {
                search: "",
                page: 1,
                limit: 10,
                ...(0, query_1.parsePaginationQuery)(req),
            };
            const { data, pagination } = await this._adminService.getAllQuestionGroups(query);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.COMMON.SUCCESS, data, pagination).send(res);
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
    createQuestionGroup = async (req, res, next) => {
        try {
            const body = req.body;
            const data = {
                key: body.key?.trim() || "",
                title: body.title?.trim() || "",
                order: Number(body.order),
            };
            await this._adminService.createQuestionGroup(data);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.CREATED, messages_1.MESSAGES.ONBOARDING.GROUP_CREATED).send(res);
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
    updateQuestionGroup = async (req, res, next) => {
        try {
            const { id } = req.params;
            const body = req.body;
            const data = {
                title: body.title?.trim() || "",
                order: Number(body.order) || 0,
            };
            await this._adminService.updateQuestionGroup(id, data);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.ONBOARDING.GROUP_UPDATED).send(res);
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
    toggleQuestionGroupStatus = async (req, res, next) => {
        try {
            await this._adminService.toggleQuestionGroupStatus(req.params.id);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.ONBOARDING.GROUP_STATUS_TOGGLED).send(res);
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
    getQuestionGroupById = async (req, res, next) => {
        try {
            const group = await this._adminService.getQuestionGroupById(req.params.id);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.COMMON.SUCCESS, group).send(res);
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
    // Questions
    getAllQuestions = async (req, res, next) => {
        try {
            const query = {
                search: "",
                page: 1,
                limit: 10,
                sortBy: "createdAt",
                sortOrder: "desc",
                ...(0, query_1.parsePaginationQuery)(req),
                ...(typeof req.query.groupId === "string" && {
                    groupId: req.query.groupId,
                }),
            };
            const { data, pagination } = await this._adminService.getAllQuestions(query);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.COMMON.SUCCESS, data, pagination).send(res);
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
    createQuestion = async (req, res, next) => {
        try {
            const data = req.body;
            const adminId = req.user?.id;
            if (!adminId)
                throw new appError_1.AppError(statuscode_1.STATUS.UNAUTHORIZED, messages_1.MESSAGES.ADMIN.UNAUTHORIZED_CONTEXT);
            await this._adminService.createQuestion(data, adminId);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.CREATED, messages_1.MESSAGES.ONBOARDING.QUESTION_CREATED).send(res);
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
    updateQuestion = async (req, res, next) => {
        try {
            await this._adminService.updateQuestion(req.params.id, req.body);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.ONBOARDING.QUESTION_UPDATED).send(res);
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
    toggleQuestionStatus = async (req, res, next) => {
        try {
            await this._adminService.toggleQuestionStatus(req.params.id);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.ONBOARDING.QUESTION_STATUS_TOGGLED).send(res);
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
    getQuestionById = async (req, res, next) => {
        try {
            const question = await this._adminService.getQuestionById(req.params.id);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.COMMON.SUCCESS, question).send(res);
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
    getAllSubscriptionTransactions = async (req, res, next) => {
        try {
            const query = {
                search: "",
                status: "",
                page: 1,
                limit: 10,
                sortBy: "createdAt",
                sortOrder: "desc",
                ...(0, query_1.parsePaginationQuery)(req),
                ...(typeof req.query.status === "string" && {
                    status: req.query.status.trim(),
                }),
            };
            const { data, pagination } = await this._adminService.getAllSubscriptionTransactions(query);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.COMMON.SUCCESS, data, pagination).send(res);
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
    getQuestionDataSources = async (req, res, next) => {
        try {
            const dataSources = await this._adminService.getQuestionDataSources();
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.COMMON.SUCCESS, dataSources).send(res);
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
    createTargetMuscle = async (req, res, next) => {
        try {
            const body = req.body;
            const data = {
                title: body.title,
                description: body.description,
                bodyRegion: body.bodyRegion,
                image: req.file,
            };
            const result = await this._adminService.createTargetMuscle(data);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.CREATED, "Target muscle created successfully.", result).send(res);
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
    getAllTargetMuscles = async (req, res, next) => {
        try {
            const query = (0, query_1.parsePaginationQuery)(req);
            const { data, pagination } = await this._adminService.getAllTargetMuscles(query);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, "Target muscles fetched successfully.", data, pagination).send(res);
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
    getTargetMuscleById = async (req, res, next) => {
        try {
            const targetMuscleId = String(req.params.id);
            const data = await this._adminService.getTargetMuscleById(targetMuscleId);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, "Target muscle fetched successfully.", data).send(res);
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
    toggleTargetMuscleStatus = async (req, res, next) => {
        try {
            const targetMuscleId = String(req.params.id);
            const data = await this._adminService.toggleTargetMuscleStatus(targetMuscleId);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, data.message, data).send(res);
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
    updateTargetMuscle = async (req, res, next) => {
        try {
            const targetMuscleId = String(req.params.id);
            const body = req.body;
            const dto = {
                targetMuscleId,
                title: body.title,
                description: body.description,
                bodyRegion: body.bodyRegion,
                image: req.file,
            };
            const data = await this._adminService.updateTargetMuscle(targetMuscleId, dto);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, "Target muscle updated successfully.", data).send(res);
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
    // Equipment Methods
    createEquipment = async (req, res, next) => {
        try {
            const body = req.body;
            const dto = {
                title: body.title,
                description: body.description,
                image: req.file,
            };
            const data = await this._adminService.createEquipment(dto);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.CREATED, "Equipment created successfully.", data).send(res);
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
            const query = req.query;
            const { data, pagination } = await this._adminService.getAllEquipment(query);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, "Equipment list fetched successfully.", data, pagination).send(res);
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
    getEquipmentById = async (req, res, next) => {
        try {
            const equipmentId = String(req.params.id);
            const data = await this._adminService.getEquipmentById(equipmentId);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, "Equipment fetched successfully.", data).send(res);
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
    toggleEquipmentStatus = async (req, res, next) => {
        try {
            const equipmentId = String(req.params.id);
            const data = await this._adminService.toggleEquipmentStatus(equipmentId);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, data.message, data).send(res);
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
    updateEquipment = async (req, res, next) => {
        try {
            const equipmentId = String(req.params.id);
            const dto = req.body;
            dto.equipmentId = equipmentId;
            dto.image = req.file;
            const data = await this._adminService.updateEquipment(equipmentId, dto);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, "Equipment updated successfully.", data).send(res);
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
    // Exercise Methods
    createExercise = async (req, res, next) => {
        try {
            const dto = req.body;
            const files = req.files;
            dto.image = files?.["image"]?.[0];
            dto.video = files?.["video"]?.[0];
            await this._adminService.createExercise(dto);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.CREATED, "Exercise created successfully.").send(res);
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
    getAllExercises = async (req, res, next) => {
        try {
            const query = req.query;
            const { data, pagination } = await this._adminService.getAllExercises(query);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, "Exercises fetched successfully.", data, pagination).send(res);
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
            const exerciseId = String(req.params.id);
            const data = await this._adminService.getExerciseById(exerciseId);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, "Exercise fetched successfully.", data).send(res);
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
    toggleExerciseStatus = async (req, res, next) => {
        try {
            const exerciseId = String(req.params.id);
            const data = await this._adminService.toggleExerciseStatus(exerciseId);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, data.message, data).send(res);
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
    updateExercise = async (req, res, next) => {
        try {
            const exerciseId = String(req.params.id);
            const dto = req.body;
            dto.exerciseId = exerciseId;
            const files = req.files;
            dto.image = files?.["image"]?.[0];
            dto.video = files?.["video"]?.[0];
            await this._adminService.updateExercise(exerciseId, dto);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, "Exercise updated successfully.").send(res);
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
exports.AdminController = AdminController;
