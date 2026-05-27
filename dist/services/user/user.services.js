"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const messages_1 = require("../../constants/messages");
const statuscode_1 = require("../../constants/statuscode");
const user_mappers_1 = require("../../mappers/user/user.mappers");
const subscription_mapper_1 = require("../../mappers/subscription/subscription.mapper");
const appError_1 = require("../../utils/appError");
const bcrypt_1 = __importDefault(require("bcrypt"));
const password_1 = require("../../utils/password");
const category_mapper_1 = require("../../mappers/category/category.mapper");
const stripe_1 = __importDefault(require("stripe"));
const roles_1 = require("../../constants/roles");
const exercise_mapper_1 = require("../../mappers/exercise/exercise.mapper");
const equipment_mapper_1 = require("../../mappers/equipment/equipment.mapper");
class UserService {
    _userRepo;
    _s3Service;
    _trainerProfileRepo;
    _paymentService;
    _categoryRepo;
    _subscriptionPlanRepository;
    _subscriptionTransactionRepository;
    _userSubscriptionRepository;
    _groupRepo;
    _questionRepo;
    _answerRepo;
    _healthMetrics;
    _exerciseRepo;
    _equipmentRepo;
    constructor(_userRepo, _s3Service, _trainerProfileRepo, _paymentService, _categoryRepo, _subscriptionPlanRepository, _subscriptionTransactionRepository, _userSubscriptionRepository, _groupRepo, _questionRepo, _answerRepo, _healthMetrics, _exerciseRepo, _equipmentRepo) {
        this._userRepo = _userRepo;
        this._s3Service = _s3Service;
        this._trainerProfileRepo = _trainerProfileRepo;
        this._paymentService = _paymentService;
        this._categoryRepo = _categoryRepo;
        this._subscriptionPlanRepository = _subscriptionPlanRepository;
        this._subscriptionTransactionRepository = _subscriptionTransactionRepository;
        this._userSubscriptionRepository = _userSubscriptionRepository;
        this._groupRepo = _groupRepo;
        this._questionRepo = _questionRepo;
        this._answerRepo = _answerRepo;
        this._healthMetrics = _healthMetrics;
        this._exerciseRepo = _exerciseRepo;
        this._equipmentRepo = _equipmentRepo;
    }
    async fetchUser(userId) {
        const user = await this._userRepo.findById(userId);
        if (!user)
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.USER.USER_NOT_FOUND);
        let profileData = null;
        if (user.role === roles_1.ROLES.TRAINER) {
            profileData = await this._trainerProfileRepo.findByUserId(userId);
        }
        return user_mappers_1.UserMapper.toFindUserResponse(user, profileData);
    }
    async updateProfile(userId, updateData) {
        if (Object.keys(updateData).length === 0) {
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.VALIDATION.NO_FIELDS_TO_UPDATE);
        }
        if (updateData.userName) {
            const existingUser = await this._userRepo.findByUsername(updateData.userName);
            if (existingUser && existingUser.id !== userId) {
                throw new appError_1.AppError(statuscode_1.STATUS.CONFLICT, messages_1.MESSAGES.USER.USERNAME_ALREADY_EXISTS);
            }
        }
        if (updateData.dateOfBirth) {
            const dob = new Date(updateData.dateOfBirth);
            const today = new Date();
            const limitDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
            if (dob > limitDate) {
                throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.USER.AGE_RESTRICTION);
            }
        }
        const updatedUser = await this._userRepo.updateProfile(userId, updateData);
        if (!updatedUser)
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.USER.USER_NOT_FOUND);
        // Update profile data
        if (updateData.gender || updateData.dateOfBirth) {
            const profileUpdates = {
                gender: updateData.gender,
                dateOfBirth: updateData.dateOfBirth
                    ? new Date(updateData.dateOfBirth)
                    : undefined,
            };
            if (updatedUser.role === roles_1.ROLES.TRAINER) {
                await this._trainerProfileRepo.upsert({ userId }, profileUpdates);
            }
        }
        return this.fetchUser(userId);
    }
    async uploadProfilePicture(userId, file) {
        const user = await this._userRepo.findById(userId);
        if (!user)
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.USER.USER_NOT_FOUND);
        if (user.profilePic) {
            try {
                await this._s3Service.deleteFile(user.profilePic);
            }
            catch {
                throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.USER.PROFILE_PICTURE_DELETE_FAILED);
            }
        }
        const profilePicUrl = await this._s3Service.uploadFile(file, `profile-pictures/${userId}`);
        await this._userRepo.updateProfile(userId, { profilePic: profilePicUrl });
        return profilePicUrl;
    }
    async changePassword(userId, dto) {
        const user = await this._userRepo.findById(userId);
        if (!user)
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.USER.USER_NOT_FOUND);
        const match = await bcrypt_1.default.compare(dto.currentPassword, user.password);
        if (!match)
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.PASSWORD.INCORRECT_CURRENT_PASSWORD);
        const sameAsOld = await bcrypt_1.default.compare(dto.newPassword, user.password);
        if (sameAsOld)
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.PASSWORD.NEW_PASSWORD_SAME_AS_OLD);
        const hashedPassword = await (0, password_1.hashPassword)(dto.newPassword);
        await this._userRepo.updatePassword(userId, hashedPassword);
    }
    async getTrainers(query) {
        const page = query.page || 1;
        const limit = query.limit || 9;
        const { data, total } = await this._trainerProfileRepo.getApprovedTrainersPaginated(page, limit, query.search, query.sortBy, query.sortOrder, query.specializationId);
        return {
            data: user_mappers_1.UserMappers.toListItemDtoArray(data),
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit,
            },
        };
    }
    async getTrainerById(trainerId) {
        const data = await this._trainerProfileRepo.getTrainerByIdWithUser(trainerId);
        if (!data) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.TRAINER.NOT_FOUND);
        }
        return user_mappers_1.UserMappers.toTrainerDetailDto(data);
    }
    async getCategories(query) {
        return this._categoryRepo.getAllCategories({
            ...query,
            isActive: true,
        });
    }
    async getCategoryById(id) {
        const category = await this._categoryRepo.getCategoryById(id);
        if (!category)
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.ADMIN.CATEGORY_NOT_FOUND);
        return category_mapper_1.CategoryMappers.toCategoryDetailDto(category);
    }
    async getAllEquipment(query) {
        const { data, pagination } = await this._equipmentRepo.getAllEquipment({
            ...query,
            isActive: true,
        });
        return {
            data: equipment_mapper_1.EquipmentMapper.toEquipmentDtoList(data),
            pagination,
        };
    }
    async getMySubscriptions() {
        const plans = await this._subscriptionPlanRepository.getActiveSubscriptionPlans();
        if (!plans)
            return null;
        return subscription_mapper_1.SubscriptionMapper.toUserPlanResponseDtoList(plans);
    }
    async createCheckoutSession(userId, planId) {
        const activeSub = await this._userSubscriptionRepository.findActiveByUserId(userId);
        if (activeSub) {
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.SUBSCRIPTION_PLAN.ALREADY_SUBSCRIBED);
        }
        const plan = await this._subscriptionPlanRepository.getSubscriptionPlanById(planId);
        if (!plan) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.SUBSCRIPTION_PLAN.NOT_FOUND);
        }
        const result = await this._paymentService.createCheckoutSession({
            planName: plan.name,
            description: plan.description ?? "Bodometer Premium Access",
            amount: Math.round(plan.price * 100),
            currency: "inr",
            successUrl: `${process.env.CLIENT_URL}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${process.env.CLIENT_URL}/subscription-cancel`,
            metadata: {
                userId,
                planId,
            },
        });
        return { checkoutUrl: result.url };
    }
    //verifyPaymentAndSave
    async verifyPaymentAndSave(userId, sessionId) {
        const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status !== "paid") {
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.VALIDATION.PAYMENT_NOT_COMPLETED);
        }
        const sessionUserId = session.metadata?.userId;
        if (sessionUserId !== userId) {
            throw new appError_1.AppError(statuscode_1.STATUS.FORBIDDEN, messages_1.MESSAGES.VALIDATION.SESSION_USER_MISMATCH);
        }
        const planId = session.metadata?.planId;
        if (!planId) {
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.VALIDATION.PLAN_ID_REQUIRED);
        }
        const existing = await this._subscriptionTransactionRepository.findByTransactionId(sessionId);
        if (existing) {
            const activeSub = await this.getActiveSubscription(userId);
            if (!activeSub)
                throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.SUBSCRIPTION_PLAN.NO_ACTIVE_SUB_FOR_SESSION);
            return activeSub;
        }
        const plan = await this._subscriptionPlanRepository.getSubscriptionPlanById(planId);
        if (!plan) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.SUBSCRIPTION_PLAN.NOT_FOUND);
        }
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + (plan.durationInDays ?? 30));
        const userSubscription = await this._userSubscriptionRepository.create({
            userId,
            subscriptionPlanId: planId,
            startDate,
            endDate,
        });
        await this._subscriptionTransactionRepository.create({
            userId,
            subscriptionPlanId: planId,
            userSubscriptionId: String(userSubscription._id),
            amount: (session.amount_total ?? 0) / 100,
            currency: (session.currency ?? "inr").toUpperCase(),
            paymentMethod: "card",
            paymentGateway: "stripe",
            transactionId: sessionId,
            paymentStatus: "success",
            paidAt: new Date(),
            meta: {
                stripeSessionId: sessionId,
                customerEmail: session.customer_details?.email,
            },
        });
        return {
            subscriptionId: String(userSubscription._id),
            planId,
            planName: plan.name,
            startDate,
            endDate,
            status: "active",
            daysRemaining: plan.durationInDays ?? 30,
        };
    }
    async getActiveSubscription(userId) {
        const sub = await this._userSubscriptionRepository.findActiveByUserId(userId);
        if (!sub)
            return null;
        const plan = sub.subscriptionPlanId;
        const daysRemaining = Math.max(0, Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
        return {
            subscriptionId: String(sub._id),
            planId: String(plan?._id),
            planName: plan?.name ?? "Unknown",
            startDate: sub.startDate,
            endDate: sub.endDate,
            status: sub.status,
            daysRemaining,
        };
    }
    async _buildActiveSubscriptionDto(userId) {
        const sub = await this.getActiveSubscription(userId);
        if (!sub)
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.SUBSCRIPTION_PLAN.NO_ACTIVE_SUB);
        return sub;
    }
    async getOnboardingGroups() {
        return this._groupRepo.getAllGroups({ limit: 100, isActive: true });
    }
    async getOnboardingQuestions() {
        return this._questionRepo.getAllQuestions({ limit: 500, isActive: true });
    }
    async submitOnboarding(userId, data) {
        const submission = {
            userId,
            answers: data.answers.map((ans) => ({
                questionId: ans.questionId,
                questionKey: ans.key,
                answer: ans.value,
            })),
            completed: true,
        };
        await this._answerRepo.saveUserAnswers(submission);
    }
    async getOnboardingStatus(userId) {
        const userAnswers = await this._answerRepo.getUserAnswers(userId);
        return { completed: userAnswers?.completed ?? false };
    }
    async getOnboardingAnswers(userId) {
        return this._answerRepo.getUserAnswers(userId);
    }
    async getUserTransactions(userId, search, sortBy, sortOrder, page, limit, status) {
        const { data, pagination } = await this._subscriptionTransactionRepository.findUserTransactionsPaginated(userId, search, sortBy, sortOrder, page, limit, status);
        return {
            data: subscription_mapper_1.SubscriptionMapper.toTransactionDtoList(data),
            pagination,
        };
    }
    async calculateBmi(data) {
        return this._healthMetrics.bmiCalculator(data);
    }
    async getExercises(query) {
        const result = await this._exerciseRepo.getAllExercises({
            ...query,
        });
        return {
            data: exercise_mapper_1.ExerciseMapper.toExerciseDtoList(result.data),
            pagination: result.pagination,
        };
    }
    async getExerciseById(id) {
        const exercise = await this._exerciseRepo.getExerciseById(id);
        if (!exercise) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.EXERCISE.NOT_FOUND);
        }
        return exercise_mapper_1.ExerciseMapper.toExerciseDto(exercise);
    }
}
exports.UserService = UserService;
