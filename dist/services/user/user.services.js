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
const mongoose_1 = __importDefault(require("mongoose"));
const password_1 = require("../../utils/password");
const ai_workout_service_1 = require("../ai-services/ai-workout.service");
const fitness_constant_1 = require("../../constants/fitness.constant");
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
    _userWorkoutPlanRepo;
    constructor(_userRepo, _s3Service, _trainerProfileRepo, _paymentService, _categoryRepo, _subscriptionPlanRepository, _subscriptionTransactionRepository, _userSubscriptionRepository, _groupRepo, _questionRepo, _answerRepo, _healthMetrics, _exerciseRepo, _equipmentRepo, _userWorkoutPlanRepo) {
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
        this._userWorkoutPlanRepo = _userWorkoutPlanRepo;
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
    async getUserTransactions(userId, query) {
        const { data, pagination } = await this._subscriptionTransactionRepository.findUserTransactionsPaginated(userId, query.search, query.sortBy, query.sortOrder, query.page, query.limit, query.status);
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
    async generateWorkout(userId) {
        const onboardingAnswers = await this._answerRepo.getUserAnswers(userId);
        if (!onboardingAnswers || !onboardingAnswers.completed) {
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, "Please complete onboarding before generating a workout plan.");
        }
        const { generationStatus } = await this.getWorkoutPlans(userId);
        // only allow generation if the user has no plans, or if all days are finished, or if they are inactive
        if (!generationStatus.canGenerate) {
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.WORKOUT_PLAN.GENERATE_LOCKED);
        }
        const answersMap = {};
        for (const ans of onboardingAnswers.answers) {
            if (ans.questionKey) {
                answersMap[ans.questionKey] = ans.answer;
            }
        }
        const activeExercises = await this._exerciseRepo.findAll({ isActive: true });
        const exerciseDataMap = new Map(activeExercises.map((ex) => [
            ex._id?.toString() ?? "",
            { title: ex.title, image: ex.media?.image ?? "" },
        ]));
        // Derive history counts from the array of weekly documents
        const userDocs = await this._userWorkoutPlanRepo.findAllByUserId(userId);
        const previousPlansCount = userDocs.length;
        let completedWorkoutDaysTotal = 0;
        for (const week of userDocs) {
            for (const day of week.workoutDays) {
                if (day.status === fitness_constant_1.WORKOUT_DAY_STATUS.COMPLETED) {
                    completedWorkoutDaysTotal++;
                }
            }
        }
        const availableExercises = activeExercises.map((ex) => ({
            id: ex._id ? ex._id.toString() : "",
            key: ex.key,
            title: ex.title,
            difficulty: ex.difficulty,
            isCompound: ex.isCompound,
            workoutEnvironments: ex.workoutEnvironments,
        }));
        const past4Weeks = userDocs.slice(-4).map(week => ({
            weekNumber: week.weekNumber,
            status: week.status,
            workoutDays: week.workoutDays.map(day => ({
                dayNumber: day.dayNumber,
                type: day.type,
                status: day.status,
                exercises: day.exercises.map(ex => {
                    const exData = exerciseDataMap.get(ex.exerciseId.toString());
                    return {
                        exerciseTitle: exData?.title ?? "Unknown Exercise",
                        sets: ex.sets,
                        reps: ex.reps,
                        durationSeconds: ex.durationSeconds,
                        status: ex.status,
                        timeTakenSeconds: ex.timeTakenSeconds
                    };
                })
            }))
        }));
        const aiWorkoutService = new ai_workout_service_1.AiWorkoutService();
        const aiResponse = await aiWorkoutService.generateWorkoutPlan({
            answers: answersMap,
            availableExercises,
            previousPlansCount,
            completedWorkoutDaysTotal,
            past4WeeksData: past4Weeks,
        });
        await this._userWorkoutPlanRepo.expireActiveWeeks(userId);
        const embeddedDays = aiResponse.weekPlan.map((dayData, i) => {
            const embeddedExercises = dayData.exercises.map((ex) => {
                return {
                    instanceId: ex.instanceId,
                    exerciseId: new mongoose_1.default.Types.ObjectId(ex.exerciseId),
                    order: ex.order,
                    targetMuscles: ex.targetMuscles || [],
                    sets: ex.sets,
                    reps: ex.reps,
                    durationSeconds: ex.durationSeconds,
                    restSeconds: ex.restSeconds,
                    notes: ex.notes,
                };
            });
            // calculate scheduledDate for this day
            const dayScheduledDate = new Date();
            dayScheduledDate.setDate(dayScheduledDate.getDate() + i);
            return {
                dayNumber: i + 1,
                dayName: dayData.day,
                scheduledDate: dayScheduledDate,
                type: dayData.type.toUpperCase() === fitness_constant_1.WORKOUT_DAY_TYPE.WORKOUT
                    ? fitness_constant_1.WORKOUT_DAY_TYPE.WORKOUT
                    : fitness_constant_1.WORKOUT_DAY_TYPE.REST,
                focus: dayData.focus,
                estimatedDurationMinutes: dayData.estimatedDurationMinutes,
                status: fitness_constant_1.WORKOUT_DAY_STATUS.PENDING,
                exercises: embeddedExercises,
            };
        });
        const weekNumber = previousPlansCount + 1;
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 7);
        // Push the new week into the user document
        const updatedDoc = await this._userWorkoutPlanRepo.createWeek(userId, {
            weekNumber,
            startDate,
            endDate,
            status: fitness_constant_1.WORKOUT_PLAN_STATUS.ACTIVE,
            workoutDays: embeddedDays,
        });
        const populatedDays = aiResponse.weekPlan.map((day) => ({
            ...day,
            exercises: day.exercises.map((ex) => {
                const exData = exerciseDataMap.get(ex.exerciseId);
                return {
                    ...ex,
                    exerciseTitle: exData?.title ?? "Exercise",
                    exerciseImage: exData?.image ?? "",
                };
            }),
        }));
        return {
            workoutPlanId: updatedDoc._id.toString(),
            days: populatedDays,
            planType: "custom",
        };
    }
    async getWorkoutPlans(userId) {
        let userDocs = await this._userWorkoutPlanRepo.findAllByUserId(userId);
        //  auto-generate a new one
        if (userDocs && userDocs.length > 0) {
            const activeDoc = userDocs.find(doc => doc.status === fitness_constant_1.WORKOUT_PLAN_STATUS.ACTIVE);
            const now = new Date();
            if (activeDoc && new Date(activeDoc.endDate) < now) {
                await this.generateWorkout(userId);
                userDocs = await this._userWorkoutPlanRepo.findAllByUserId(userId);
            }
        }
        if (!userDocs || userDocs.length === 0) {
            return {
                plans: [],
                generationStatus: {
                    canGenerate: true,
                    isInactive: false,
                    pendingDaysCount: 0,
                    hasCompletedWorkoutToday: false,
                    firstPendingDayNumber: -1
                }
            };
        }
        const sortedWeeks = [...userDocs].sort((a, b) => b.weekNumber - a.weekNumber);
        //finding exercises id
        const exerciseIds = new Set();
        sortedWeeks.forEach(week => {
            week.workoutDays.forEach(day => {
                day.exercises.forEach(ex => exerciseIds.add(ex.exerciseId.toString()));
            });
        });
        //finding exersice by id
        const exercises = await this._exerciseRepo.findByIds(Array.from(exerciseIds));
        const exerciseDataMap = new Map(exercises.map((ex) => {
            return [ex._id, { title: ex.title, image: ex.media?.image ?? "", muscles: ex.targetMuscles }];
        }));
        const plans = sortedWeeks.map((week) => ({
            workoutPlanId: week._id.toString(),
            days: week.workoutDays.map((wd) => ({
                dayNumber: wd.dayNumber,
                day: wd.dayName,
                scheduledDate: wd.scheduledDate,
                type: wd.type.toLowerCase(),
                focus: wd.focus ?? "",
                estimatedDurationMinutes: wd.estimatedDurationMinutes ?? 0,
                status: wd.status,
                startedAt: wd.startedAt,
                completedAt: wd.completedAt,
                exercises: wd.exercises.map((ex) => {
                    const exData = exerciseDataMap.get(ex.exerciseId.toString());
                    return {
                        instanceId: ex.instanceId,
                        order: ex.order,
                        exerciseId: ex.exerciseId.toString(),
                        exerciseTitle: exData?.title ?? "Unknown Exercise",
                        exerciseImage: exData?.image ?? "",
                        targetMuscles: exData?.muscles || [],
                        sets: ex.sets,
                        reps: ex.reps ?? 0,
                        durationSeconds: ex.durationSeconds,
                        estimatedDurationSeconds: ex.estimatedDurationSeconds,
                        restSeconds: ex.restSeconds,
                        notes: ex.notes ?? "",
                        status: ex.status ?? fitness_constant_1.WORKOUT_EXERCISE_STATUS.PENDING,
                        startedAt: ex.startedAt,
                        timeTakenSeconds: ex.timeTakenSeconds,
                    };
                }),
            })),
            planType: "custom",
            weekNumber: week.weekNumber,
            startDate: week.startDate,
            formattedStartDate: new Date(week.startDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
            }),
            endDate: week.endDate,
            formattedEndDate: week.endDate ? new Date(week.endDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
            }) : undefined,
            status: week.status,
        }));
        const latestPlan = plans[0];
        const INACTIVITY_DAYS = 4;
        const MS_PER_DAY = 1000 * 60 * 60 * 24;
        let isInactive = false;
        let mostRecentCompleted = null;
        for (const plan of plans) {
            for (const day of plan.days) {
                if (day.status === fitness_constant_1.WORKOUT_DAY_STATUS.COMPLETED && day.completedAt) {
                    const d = new Date(day.completedAt);
                    if (!mostRecentCompleted || d.getTime() > mostRecentCompleted.getTime()) {
                        mostRecentCompleted = d;
                    }
                }
            }
        }
        let hasCompletedWorkoutToday = false;
        const todayStr = new Date().toDateString();
        if (mostRecentCompleted) {
            hasCompletedWorkoutToday = mostRecentCompleted.toDateString() === todayStr;
            const daysSinceLastWorkout = (Date.now() - mostRecentCompleted.getTime()) / MS_PER_DAY;
            if (daysSinceLastWorkout >= INACTIVITY_DAYS) {
                isInactive = true;
            }
        }
        else if (latestPlan?.startDate) {
            const daysSinceStart = (Date.now() - new Date(latestPlan.startDate).getTime()) / MS_PER_DAY;
            if (daysSinceStart >= INACTIVITY_DAYS) {
                isInactive = true;
            }
        }
        const allDaysFinished = latestPlan ? latestPlan.days.every(d => d.status === fitness_constant_1.WORKOUT_DAY_STATUS.COMPLETED || d.status === fitness_constant_1.WORKOUT_DAY_STATUS.SKIPPED) : true;
        const pendingDaysCount = latestPlan ? latestPlan.days.filter(d => d.status === fitness_constant_1.WORKOUT_DAY_STATUS.PENDING).length : 0;
        const canGenerate = allDaysFinished || isInactive;
        let firstPendingDayNumber = -1;
        if (latestPlan) {
            const pendingDay = latestPlan.days.find(d => d.status === fitness_constant_1.WORKOUT_DAY_STATUS.PENDING);
            firstPendingDayNumber = pendingDay ? pendingDay.dayNumber : -1;
        }
        return {
            plans,
            generationStatus: {
                canGenerate,
                isInactive,
                pendingDaysCount,
                hasCompletedWorkoutToday,
                firstPendingDayNumber
            }
        };
    }
    async markDayCompleted({ userId, dayNumber, completed }) {
        const activeWeek = await this._userWorkoutPlanRepo.findActiveWeekByUserId(userId);
        if (!activeWeek) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.WORKOUT_PLAN.NOT_FOUND);
        }
        const day = activeWeek.workoutDays.find((d) => d.dayNumber === dayNumber);
        if (!day) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, "Workout day not found");
        }
        day.status = completed ? fitness_constant_1.WORKOUT_DAY_STATUS.COMPLETED : fitness_constant_1.WORKOUT_DAY_STATUS.PENDING;
        day.completedAt = completed ? new Date() : undefined;
        if (day.exercises && day.exercises.length > 0) {
            day.exercises.forEach((ex) => {
                ex.status = completed ? fitness_constant_1.WORKOUT_EXERCISE_STATUS.COMPLETED : fitness_constant_1.WORKOUT_EXERCISE_STATUS.PENDING;
                if (completed && !ex.timeTakenSeconds) {
                    ex.timeTakenSeconds = ex.durationSeconds ?? 60;
                }
            });
        }
        await this._userWorkoutPlanRepo.saveWeek(activeWeek);
        const plansResponse = await this.getWorkoutPlans(userId);
        const updatedPlan = plansResponse.plans.find((p) => p.workoutPlanId === activeWeek._id.toString());
        if (!updatedPlan)
            throw new appError_1.AppError(statuscode_1.STATUS.INTERNAL_ERROR, "Failed to retrieve updated plan");
        return updatedPlan;
    }
    async markExerciseStatus({ userId, dayNumber, instanceId, status }) {
        const activeWeek = await this._userWorkoutPlanRepo.findActiveWeekByUserId(userId);
        if (!activeWeek) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.WORKOUT_PLAN.NOT_FOUND);
        }
        const day = activeWeek.workoutDays.find((d) => d.dayNumber === dayNumber);
        if (!day) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, "Workout day not found");
        }
        const exercise = day.exercises.find((e) => e.instanceId === instanceId);
        if (!exercise) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, "Exercise not found");
        }
        // Timer logic
        if (status === fitness_constant_1.WORKOUT_EXERCISE_STATUS.ACTIVE) {
            const isAnyActive = activeWeek.workoutDays.some((d) => d.exercises.some((e) => e.status === fitness_constant_1.WORKOUT_EXERCISE_STATUS.ACTIVE && e.instanceId !== instanceId));
            if (isAnyActive) {
                throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, "Another exercise is currently in progress. Please complete or pause it first.");
            }
            exercise.startedAt = new Date();
        }
        else if (status === fitness_constant_1.WORKOUT_EXERCISE_STATUS.COMPLETED) {
            if (exercise.startedAt) {
                const diffSeconds = Math.floor((Date.now() - exercise.startedAt.getTime()) / 1000);
                const maxDuration = 900;
                exercise.timeTakenSeconds = Math.min(diffSeconds, maxDuration);
            }
            else {
                exercise.timeTakenSeconds = exercise.durationSeconds ?? 60;
            }
        }
        exercise.status = status;
        const allExercisesFinished = day.exercises.length > 0 && day.exercises.every(e => e.status === fitness_constant_1.WORKOUT_EXERCISE_STATUS.COMPLETED || e.status === fitness_constant_1.WORKOUT_EXERCISE_STATUS.SKIPPED);
        day.status = allExercisesFinished ? fitness_constant_1.WORKOUT_DAY_STATUS.COMPLETED : fitness_constant_1.WORKOUT_DAY_STATUS.PENDING;
        day.completedAt = allExercisesFinished ? new Date() : undefined;
        await this._userWorkoutPlanRepo.saveWeek(activeWeek);
        const plansResponse = await this.getWorkoutPlans(userId);
        const updatedPlan = plansResponse.plans.find((p) => p.workoutPlanId === activeWeek._id.toString());
        if (!updatedPlan)
            throw new appError_1.AppError(statuscode_1.STATUS.INTERNAL_ERROR, "Failed to retrieve updated plan");
        return updatedPlan;
    }
    async getWorkoutProgress(userId, timeframe) {
        const plansResponse = await this.getWorkoutPlans(userId);
        if (!plansResponse.plans || plansResponse.plans.length === 0) {
            return {
                currentStreak: 0,
                completionRate: 0,
                workoutsCompleted: 0,
                totalTrainingMinutes: 0,
                currentWeekProgress: 0,
                todayWorkoutProgress: 0,
                plannedWorkouts: 0,
                completedWorkouts: 0,
                skippedWorkouts: 0,
                weeklyCompletionTrend: [],
                dailyCompletionTrend: [],
                monthlyCompletionTrend: [],
                muscleDistribution: [],
                recentActivities: [],
            };
        }
        const plans = plansResponse.plans;
        const activePlan = plans.find(p => p.status === fitness_constant_1.WORKOUT_EXERCISE_STATUS.ACTIVE);
        let totalPlanned = 0;
        let totalCompleted = 0;
        let totalTrainingSeconds = 0;
        const recentActivities = [];
        const muscleMap = new Map();
        // Weekly trend
        const weeklyCompletionTrend = plans.map(p => {
            const wDays = p.days.filter(d => d.type === 'workout');
            const wCompleted = wDays.filter(d => d.status === fitness_constant_1.WORKOUT_DAY_STATUS.COMPLETED).length;
            return {
                weekNumber: p.weekNumber,
                completionRate: wDays.length > 0 ? (wCompleted / wDays.length) * 100 : 0
            };
        }).reverse().slice(-5);
        //daily trend
        const dailyCompletionTrend = [];
        if (activePlan) {
            for (const day of activePlan.days) {
                if (day.type === 'workout') {
                    const rate = day.status === fitness_constant_1.WORKOUT_DAY_STATUS.COMPLETED ? 100 : 0;
                    dailyCompletionTrend.push({
                        dayName: day.day,
                        completionRate: rate
                    });
                }
            }
        }
        // Monthly trend
        const monthlyMap = new Map();
        for (const plan of plans) {
            if (plan.startDate) {
                const monthName = new Date(plan.startDate).toLocaleString('default', { month: 'short' });
                const entry = monthlyMap.get(monthName) || { planned: 0, completed: 0 };
                const wDays = plan.days.filter(d => d.type === 'workout');
                const wCompleted = wDays.filter(d => d.status === fitness_constant_1.WORKOUT_DAY_STATUS.COMPLETED).length;
                entry.planned += wDays.length;
                entry.completed += wCompleted;
                monthlyMap.set(monthName, entry);
            }
        }
        const monthlyCompletionTrend = Array.from(monthlyMap.entries()).map(([monthName, data]) => ({
            monthName,
            completionRate: data.planned > 0 ? Math.round((data.completed / data.planned) * 100) : 0
        })).reverse().slice(-6);
        // timeframe
        let filteredPlans = plans;
        const now = new Date();
        if (timeframe === fitness_constant_1.TIMEFRAME.DAILY) {
            filteredPlans = activePlan ? [activePlan] : [];
        }
        else if (timeframe === fitness_constant_1.TIMEFRAME.WEEKLY) {
            const fiveWeeksAgo = new Date();
            fiveWeeksAgo.setDate(now.getDate() - 35);
            filteredPlans = plans.filter(p => new Date(p.startDate) >= fiveWeeksAgo);
        }
        else if (timeframe === fitness_constant_1.TIMEFRAME.MONTHLY) {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(now.getMonth() - 6);
            filteredPlans = plans.filter(p => new Date(p.startDate) >= sixMonthsAgo);
        }
        //  filtered plans
        let totalPlannedExercises = 0;
        let totalCompletedExercises = 0;
        let totalSkippedExercises = 0;
        for (const plan of filteredPlans) {
            for (const day of plan.days) {
                if (day.type === 'workout') {
                    totalPlanned++;
                    if (day.status === fitness_constant_1.WORKOUT_DAY_STATUS.COMPLETED) {
                        totalCompleted++;
                        const activityDate = day.scheduledDate || day.completedAt;
                        if (activityDate) {
                            recentActivities.push({
                                scheduledDate: activityDate,
                                dayName: day.day,
                                status: day.status
                            });
                        }
                    }
                    for (const ex of day.exercises) {
                        totalPlannedExercises++;
                        if (ex.status === fitness_constant_1.WORKOUT_EXERCISE_STATUS.COMPLETED) {
                            totalCompletedExercises++;
                            if (ex.timeTakenSeconds) {
                                totalTrainingSeconds += ex.timeTakenSeconds;
                            }
                            if (ex.targetMuscles && ex.targetMuscles.length > 0) {
                                for (const muscle of ex.targetMuscles) {
                                    muscleMap.set(muscle, (muscleMap.get(muscle) || 0) + 1);
                                }
                            }
                            else {
                                muscleMap.set('General', (muscleMap.get('General') || 0) + 1);
                            }
                        }
                        else if (ex.status === fitness_constant_1.WORKOUT_EXERCISE_STATUS.SKIPPED) {
                            totalSkippedExercises++;
                        }
                    }
                }
            }
        }
        // Active Week Progress
        let currentWeekProgress = 0;
        let todayWorkoutProgress = 0;
        if (activePlan) {
            const wDays = activePlan.days.filter(d => d.type === 'workout');
            const wCompleted = wDays.filter(d => d.status === fitness_constant_1.WORKOUT_DAY_STATUS.COMPLETED).length;
            currentWeekProgress = wDays.length > 0 ? Math.round((wCompleted / wDays.length) * 100) : 0;
            // workout
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let targetDay = activePlan.days.find(d => {
                if (!d.scheduledDate)
                    return false;
                const dDate = new Date(d.scheduledDate);
                dDate.setHours(0, 0, 0, 0);
                return dDate.getTime() === today.getTime();
            });
            if (!targetDay || targetDay.type !== 'workout') {
                targetDay = activePlan.days.find(d => d.type === 'workout' && d.status === fitness_constant_1.WORKOUT_DAY_STATUS.PENDING);
            }
            if (targetDay && targetDay.exercises && targetDay.exercises.length > 0) {
                const completedEx = targetDay.exercises.filter(ex => ex.status === fitness_constant_1.WORKOUT_EXERCISE_STATUS.COMPLETED).length;
                todayWorkoutProgress = Math.round((completedEx / targetDay.exercises.length) * 100);
            }
            else if (targetDay && targetDay.status === fitness_constant_1.WORKOUT_DAY_STATUS.COMPLETED) {
                todayWorkoutProgress = 100;
            }
        }
        // Current Streak Calculation
        let currentStreak = 0;
        const allDays = plans.flatMap(p => p.days).filter(d => d.scheduledDate).sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        const currentDate = new Date(todayDate);
        let foundBreak = false;
        while (!foundBreak) {
            const targetTime = currentDate.getTime();
            const dayForDate = allDays.find(d => {
                const dTime = new Date(d.scheduledDate).setHours(0, 0, 0, 0);
                return dTime === targetTime;
            });
            if (!dayForDate) {
                break;
            }
            if (dayForDate.type === 'workout') {
                if (dayForDate.status === fitness_constant_1.WORKOUT_DAY_STATUS.COMPLETED) {
                    currentStreak++;
                }
                else if (dayForDate.status === fitness_constant_1.WORKOUT_DAY_STATUS.PENDING) {
                    if (targetTime !== todayDate.getTime()) {
                        foundBreak = true;
                    }
                }
                else if (dayForDate.status === fitness_constant_1.WORKOUT_DAY_STATUS.SKIPPED) {
                    foundBreak = true;
                }
            }
            else if (dayForDate.type === 'rest') {
                currentStreak++;
            }
            currentDate.setDate(currentDate.getDate() - 1);
        }
        const muscleDistribution = Array.from(muscleMap.entries()).map(([muscleName, count]) => ({
            muscleName, count
        }));
        return {
            currentStreak,
            completionRate: totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0,
            workoutsCompleted: totalCompleted,
            totalTrainingMinutes: Math.round(totalTrainingSeconds / 60),
            currentWeekProgress,
            todayWorkoutProgress,
            plannedWorkouts: totalPlannedExercises,
            completedWorkouts: totalCompletedExercises,
            skippedWorkouts: totalSkippedExercises,
            weeklyCompletionTrend,
            dailyCompletionTrend,
            monthlyCompletionTrend,
            muscleDistribution,
            recentActivities: recentActivities.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()).slice(0, 5)
        };
    }
}
exports.UserService = UserService;
