import { MESSAGES } from "../../constants/messages";
import { STATUS } from "../../constants/statuscode";
import { ITrainerProfileRepository } from "../../interfaces/repository-interface/trainer/trainer.profile-repository.interface";
import { IUserRepository } from "../../interfaces/repository-interface/user/user-repository.interface";
import { IPaymentService } from "../../interfaces/service-interface/payment/stripe-service.interface";
import { IS3Service } from "../../interfaces/service-interface/s3/s3-service.interface";
import { IUserService } from "../../interfaces/service-interface/user/user-service.interface";
import { UserMapper, UserMappers } from "../../mappers/user/user.mappers";
import { SubscriptionMapper } from "@/mappers/subscription/subscription.mapper";
import { AppError } from "../../utils/appError";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { hashPassword } from "../../utils/password";
import { AiWorkoutService } from "../ai-services/ai-workout.service";
import { IUserWorkoutPlanRepository } from "@/interfaces/repository-interface/workout/user-workout-plan.repository.interface";
import { WORKOUT_DAY_TYPE, WORKOUT_DAY_STATUS, WORKOUT_PLAN_STATUS, WorkoutExerciseStatus } from "@/constants/fitness.constant";
import { IEmbeddedWorkoutDay, IEmbeddedWorkoutExercise } from "@/models/user.workout-plan.model";
import {
  ChangePasswordDto,
  FindUserResponseDto,
  UpdateBmiDto,
  UpdateBmiResponseDto,
  UpdateUserProfileDto,
} from "../../dto/user/user.dto";
import {
  ActiveSubscriptionDto,
  SubscriptionTransactionDto,
  UserSubscriptionPlanResponseDto,
  SubscriptionTransactionQueryDto,
} from "../../dto/subscription/subscription.dto";
import {
  GetTrainersQueryDto,
  TrainerDetailDto,
  TrainerListResponseDto,
} from "../../dto/trainer/trainer.dto";
import { CategoryDetailDto } from "../../dto/category/category.dto";
import { ICategoryRepository } from "../../interfaces/repository-interface/category/category-repository.interface";
import {
  CategoryQuery,
  GetAllCategoriesResponse,
} from "../../interfaces/domain.interface/category.interface";
import {
  GetAllQuestionGroupsResponse,
  GetAllQuestionsResponse,
  OnboardingValue,
  UserAnswerSubmission,
} from "../../interfaces/domain.interface/onboarding.interface";
import { CategoryMappers } from "@/mappers/category/category.mapper";
import { ISubscriptionPlanRepository } from "@/interfaces/repository-interface/subscription/subscription-plan.repository";
import Stripe from "stripe";
import { ISubscriptionTransactionRepository } from "@/interfaces/repository-interface/subscription/subscription.transaction-repository.interface";
import { IUserSubscriptionRepository } from "@/interfaces/repository-interface/subscription/user.subscription.repository.interface";
import { IGroupRepository } from "@/interfaces/repository-interface/onboarding/group-repository.interface";
import { IQuestionRepository } from "@/interfaces/repository-interface/onboarding/question-repository.interface";
import { IAnswerRepository } from "@/interfaces/repository-interface/onboarding/answer-repository.interface";
import { ROLES } from "@/constants/roles";
import { PaginationMeta } from "@/interfaces/domain.interface/common.interface";
import { IHealthMetrics } from "@/interfaces/service-interface/health.metrics/health.metrics-service.interface";
import { IExerciseRepository } from "@/interfaces/repository-interface/exercise/exercise-repository.interface";
import { IEquipmentRepository } from "@/interfaces/repository-interface/equipment/equipment-repository.interface";
import { ExerciseMapper } from "../../mappers/exercise/exercise.mapper";
import { EquipmentMapper } from "../../mappers/equipment/equipment.mapper";
import { ExerciseQueryDto, GetAllExercisesResponseDto, ExerciseDto, WorkoutPlanDetailDto, WorkoutPlanResponseDto } from "../../dto/exercise/exercise.dto";
import { EquipmentQueryDto, GetAllEquipmentResponseDto } from "../../dto/equipment/equipment.dto";


export class UserService implements IUserService {

  constructor(
    private _userRepo: IUserRepository,
    private _s3Service: IS3Service,
    private _trainerProfileRepo: ITrainerProfileRepository,
    private _paymentService: IPaymentService,
    private _categoryRepo: ICategoryRepository,
    private _subscriptionPlanRepository: ISubscriptionPlanRepository,
    private _subscriptionTransactionRepository: ISubscriptionTransactionRepository,
    private _userSubscriptionRepository: IUserSubscriptionRepository,
    private _groupRepo: IGroupRepository,
    private _questionRepo: IQuestionRepository,
    private _answerRepo: IAnswerRepository,
    private _healthMetrics: IHealthMetrics,
    private _exerciseRepo: IExerciseRepository,
    private _equipmentRepo: IEquipmentRepository,
    private _userWorkoutPlanRepo: IUserWorkoutPlanRepository,
  ) { }

  async fetchUser(userId: string): Promise<FindUserResponseDto> {
    const user = await this._userRepo.findById(userId);
    if (!user)
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.USER.USER_NOT_FOUND);

    let profileData = null;
    if (user.role === ROLES.TRAINER) {
      profileData = await this._trainerProfileRepo.findByUserId(userId);
    }

    return UserMapper.toFindUserResponse(user, profileData);
  }

  async updateProfile(
    userId: string,
    updateData: UpdateUserProfileDto,
  ): Promise<FindUserResponseDto> {
    if (Object.keys(updateData).length === 0) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.NO_FIELDS_TO_UPDATE);
    }
    if (updateData.userName) {
      const existingUser = await this._userRepo.findByUsername(
        updateData.userName,
      );
      if (existingUser && existingUser.id !== userId) {
        throw new AppError(STATUS.CONFLICT, MESSAGES.USER.USERNAME_ALREADY_EXISTS);
      }
    }

    if (updateData.dateOfBirth) {
      const dob = new Date(updateData.dateOfBirth);
      const today = new Date();
      const limitDate = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate(),
      );
      if (dob > limitDate) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.USER.AGE_RESTRICTION);
      }
    }
    const updatedUser = await this._userRepo.updateProfile(userId, updateData);
    if (!updatedUser)
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.USER.USER_NOT_FOUND);

    // Update profile data
    if (updateData.gender || updateData.dateOfBirth) {
      const profileUpdates = {
        gender: updateData.gender,
        dateOfBirth: updateData.dateOfBirth
          ? new Date(updateData.dateOfBirth)
          : undefined,
      };

      if (updatedUser.role === ROLES.TRAINER) {
        await this._trainerProfileRepo.upsert({ userId }, profileUpdates);
      }
    }

    return this.fetchUser(userId);
  }

  async uploadProfilePicture(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const user = await this._userRepo.findById(userId);
    if (!user)
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.USER.USER_NOT_FOUND);
    if (user.profilePic) {
      try {
        await this._s3Service.deleteFile(user.profilePic);
      } catch {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.USER.PROFILE_PICTURE_DELETE_FAILED)
      }
    }
    const profilePicUrl = await this._s3Service.uploadFile(
      file,
      `profile-pictures/${userId}`,
    );
    await this._userRepo.updateProfile(userId, { profilePic: profilePicUrl });
    return profilePicUrl;
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this._userRepo.findById(userId);
    if (!user)
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.USER.USER_NOT_FOUND);

    const match = await bcrypt.compare(dto.currentPassword, user.password);
    if (!match)
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.PASSWORD.INCORRECT_CURRENT_PASSWORD,
      );

    const sameAsOld = await bcrypt.compare(dto.newPassword, user.password);
    if (sameAsOld)
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.PASSWORD.NEW_PASSWORD_SAME_AS_OLD,
      );

    const hashedPassword = await hashPassword(dto.newPassword);
    await this._userRepo.updatePassword(userId, hashedPassword);
  }

  async getTrainers(
    query: GetTrainersQueryDto,
  ): Promise<TrainerListResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 9;

    const { data, total } =
      await this._trainerProfileRepo.getApprovedTrainersPaginated(
        page,
        limit,
        query.search,
        query.sortBy,
        query.sortOrder,
        query.specializationId,
      );

    return {
      data: UserMappers.toListItemDtoArray(data),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async getTrainerById(trainerId: string): Promise<TrainerDetailDto> {
    const data =
      await this._trainerProfileRepo.getTrainerByIdWithUser(trainerId);
    if (!data) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.TRAINER.NOT_FOUND);
    }
    return UserMappers.toTrainerDetailDto(data);
  }

  async getCategories(query: CategoryQuery): Promise<GetAllCategoriesResponse> {
    return this._categoryRepo.getAllCategories({
      ...query,
      isActive: true,
    } as CategoryQuery);
  }

  async getCategoryById(id: string): Promise<CategoryDetailDto> {
    const category = await this._categoryRepo.getCategoryById(id);
    if (!category) throw new AppError(STATUS.NOT_FOUND, MESSAGES.ADMIN.CATEGORY_NOT_FOUND);
    return CategoryMappers.toCategoryDetailDto(category);
  }

  async getAllEquipment(query: EquipmentQueryDto): Promise<GetAllEquipmentResponseDto> {
    const { data, pagination } = await this._equipmentRepo.getAllEquipment({
      ...query,
      isActive: true,
    } as EquipmentQueryDto);

    return {
      data: EquipmentMapper.toEquipmentDtoList(data),
      pagination,
    };
  }

  async getMySubscriptions(): Promise<
    UserSubscriptionPlanResponseDto[] | null
  > {
    const plans = await this._subscriptionPlanRepository.getActiveSubscriptionPlans();
    if (!plans) return null;
    return SubscriptionMapper.toUserPlanResponseDtoList(plans);
  }

  async createCheckoutSession(
    userId: string,
    planId: string,
  ): Promise<{ checkoutUrl: string }> {
    const activeSub =
      await this._userSubscriptionRepository.findActiveByUserId(userId);
    if (activeSub) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.SUBSCRIPTION_PLAN.ALREADY_SUBSCRIBED,
      );
    }

    const plan =
      await this._subscriptionPlanRepository.getSubscriptionPlanById(planId);
    if (!plan) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.SUBSCRIPTION_PLAN.NOT_FOUND);
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

  async verifyPaymentAndSave(
    userId: string,
    sessionId: string,
  ): Promise<ActiveSubscriptionDto> {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.PAYMENT_NOT_COMPLETED);
    }

    const sessionUserId = session.metadata?.userId;
    if (sessionUserId !== userId) {
      throw new AppError(
        STATUS.FORBIDDEN,
        MESSAGES.VALIDATION.SESSION_USER_MISMATCH,
      );
    }

    const planId = session.metadata?.planId;
    if (!planId) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.VALIDATION.PLAN_ID_REQUIRED,
      );
    }

    const existing =
      await this._subscriptionTransactionRepository.findByTransactionId(
        sessionId,
      );
    if (existing) {
      const activeSub = await this.getActiveSubscription(userId);
      if (!activeSub)
        throw new AppError(
          STATUS.NOT_FOUND,
          MESSAGES.SUBSCRIPTION_PLAN.NO_ACTIVE_SUB_FOR_SESSION,
        );
      return activeSub;
    }

    const plan =
      await this._subscriptionPlanRepository.getSubscriptionPlanById(planId);
    if (!plan) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.SUBSCRIPTION_PLAN.NOT_FOUND);
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

  async getActiveSubscription(
    userId: string,
  ): Promise<ActiveSubscriptionDto | null> {
    const sub =
      await this._userSubscriptionRepository.findActiveByUserId(userId);
    if (!sub) return null;

    const plan = sub.subscriptionPlanId as unknown as {
      _id: unknown;
      name: string;
    };

    const daysRemaining = Math.max(
      0,
      Math.ceil(
        (new Date(sub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      ),
    );

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

  private async _buildActiveSubscriptionDto(
    userId: string,
  ): Promise<ActiveSubscriptionDto> {
    const sub = await this.getActiveSubscription(userId);
    if (!sub)
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.SUBSCRIPTION_PLAN.NO_ACTIVE_SUB);
    return sub;
  }

  async getOnboardingGroups(): Promise<GetAllQuestionGroupsResponse> {
    return this._groupRepo.getAllGroups({ limit: 100, isActive: true });
  }

  async getOnboardingQuestions(): Promise<GetAllQuestionsResponse> {
    return this._questionRepo.getAllQuestions({ limit: 500, isActive: true });
  }

  async submitOnboarding(
    userId: string,
    data: {
      answers: { questionId: string; key: string; value: OnboardingValue }[];
    },
  ): Promise<void> {
    const submission: UserAnswerSubmission = {
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

  async getOnboardingStatus(userId: string): Promise<{ completed: boolean }> {
    const userAnswers = await this._answerRepo.getUserAnswers(userId);
    return { completed: userAnswers?.completed ?? false };
  }

  async getOnboardingAnswers(
    userId: string,
  ): Promise<UserAnswerSubmission | null> {
    return this._answerRepo.getUserAnswers(userId);
  }

  async getUserTransactions(
    userId: string,
    query: SubscriptionTransactionQueryDto,
  ): Promise<{ data: SubscriptionTransactionDto[]; pagination: PaginationMeta }> {
    const { data, pagination } =
      await this._subscriptionTransactionRepository.findUserTransactionsPaginated(
        userId,
        query.search,
        query.sortBy,
        query.sortOrder,
        query.page,
        query.limit,
        query.status,
      );

    return {
      data: SubscriptionMapper.toTransactionDtoList(data),
      pagination,
    };
  }

  async calculateBmi(data: UpdateBmiDto): Promise<UpdateBmiResponseDto> {
    return this._healthMetrics.bmiCalculator(data);
  }

  async getExercises(query: ExerciseQueryDto): Promise<GetAllExercisesResponseDto> {
    const result = await this._exerciseRepo.getAllExercises({
      ...query,
    });

    return {
      data: ExerciseMapper.toExerciseDtoList(result.data),
      pagination: result.pagination,
    };
  }

  async getExerciseById(id: string): Promise<ExerciseDto> {
    const exercise = await this._exerciseRepo.getExerciseById(id);
    if (!exercise) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.EXERCISE.NOT_FOUND);
    }

    return ExerciseMapper.toExerciseDto(exercise);
  }

  async generateWorkout(userId: string): Promise<WorkoutPlanDetailDto> {
    const onboardingAnswers = await this._answerRepo.getUserAnswers(userId);
    if (!onboardingAnswers || !onboardingAnswers.completed) {
      throw new AppError(STATUS.BAD_REQUEST, "Please complete onboarding before generating a workout plan.");
    }

    // Check if there is already an unexpired active week
    const activeWeek = await this._userWorkoutPlanRepo.findActiveWeekByUserId(userId);
    const now = new Date();
    if (activeWeek && activeWeek.endDate > now) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.WORKOUT_PLAN.GENERATE_LOCKED);
    }

    const answersMap: Record<string, unknown> = {};
    for (const ans of onboardingAnswers.answers) {
      if (ans.questionKey) {
        answersMap[ans.questionKey] = ans.answer;
      }
    }

    const activeExercises = await this._exerciseRepo.findAll({ isActive: true });

    const exerciseDataMap = new Map(
      activeExercises.map((ex) => [
        ex._id?.toString() ?? "",
        { title: ex.title, image: ex.media?.image ?? "" },
      ]),
    );

    // Derive history counts from the single user document
    const userDoc = await this._userWorkoutPlanRepo.findByUserId(userId);
    const previousPlansCount = userDoc?.weeks.length ?? 0;

    let completedWorkoutDaysTotal = 0;
    for (const week of (userDoc?.weeks ?? [])) {
      for (const day of week.workoutDays) {
        if (day.status === "COMPLETED") {
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

    const past4Weeks = (userDoc?.weeks ?? []).slice(-4).map(week => ({
      weekNumber: week.weekNumber,
      status: week.status,
      workoutDays: week.workoutDays.map(day => ({
        dayNumber: day.dayNumber,
        type: day.type,
        status: day.status,
        exercises: day.exercises.map(ex => ({
          exerciseTitle: ex.exerciseTitle,
          sets: ex.sets,
          reps: ex.reps,
          durationSeconds: ex.durationSeconds,
          status: ex.status,
          timeTakenSeconds: ex.timeTakenSeconds
        }))
      }))
    }));

    const aiWorkoutService = new AiWorkoutService();
    const aiResponse = await aiWorkoutService.generateWorkoutPlan({
      answers: answersMap,
      availableExercises,
      previousPlansCount,
      completedWorkoutDaysTotal,
      past4WeeksData: past4Weeks,
    });

    // Expire any currently active week before adding the new one
    await this._userWorkoutPlanRepo.expireActiveWeeks(userId);

    const embeddedDays: IEmbeddedWorkoutDay[] = aiResponse.weekPlan.map((dayData, i) => {
      const embeddedExercises: IEmbeddedWorkoutExercise[] = dayData.exercises.map((ex) => {
        const exData = exerciseDataMap.get(ex.exerciseId);
        return {
          exerciseId: new mongoose.Types.ObjectId(ex.exerciseId),
          exerciseTitle: exData?.title ?? "Exercise",
          exerciseImage: exData?.image ?? "",
          order: ex.order,
          sets: ex.sets,
          reps: ex.reps,
          restSeconds: ex.restSeconds,
          notes: ex.notes,
        };
      });

      return {
        dayNumber: i + 1,
        dayName: dayData.day,
        type: dayData.type.toUpperCase() === WORKOUT_DAY_TYPE.WORKOUT
          ? WORKOUT_DAY_TYPE.WORKOUT
          : WORKOUT_DAY_TYPE.REST,
        focus: dayData.focus,
        estimatedDurationMinutes: dayData.estimatedDurationMinutes,
        status: WORKOUT_DAY_STATUS.PENDING,
        exercises: embeddedExercises,
      };
    });

    const weekNumber = previousPlansCount + 1;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 7);

    // Push the new week into the user's single document (upsert on first time)
    const updatedDoc = await this._userWorkoutPlanRepo.upsertNewWeek(userId, {
      weekNumber,
      startDate,
      endDate,
      status: WORKOUT_PLAN_STATUS.ACTIVE,
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

  async getWorkoutPlan(userId: string): Promise<WorkoutPlanResponseDto | null> {
    const userDoc = await this._userWorkoutPlanRepo.findByUserId(userId);
    if (!userDoc || userDoc.weeks.length === 0) return null;

    // Get the active week from the embedded weeks array
    const activeWeek = userDoc.weeks.find((w) => w.status === "ACTIVE");

    // If the active week's time has passed, auto-generate a new one
    const now = new Date();
    if (activeWeek && activeWeek.endDate < now) {
      const newPlan = await this.generateWorkout(userId);
      const freshDoc = await this._userWorkoutPlanRepo.findByUserId(userId);
      const freshWeek = freshDoc?.weeks.find((w) => w.status === "ACTIVE");
      return {
        workoutPlanId: freshDoc?._id.toString() ?? "",
        days: newPlan.days,
        planType: newPlan.planType,
        weekNumber: freshWeek?.weekNumber ?? 1,
        startDate: freshWeek?.startDate ?? new Date(),
        endDate: freshWeek?.endDate ?? new Date(),
        status: "ACTIVE",
        autoGenerated: true,
      };
    }

    if (!activeWeek) return null;

    const days = activeWeek.workoutDays.map((wd) => ({
      dayNumber: wd.dayNumber,
      day: wd.dayName,
      type: wd.type.toLowerCase() as "workout" | "rest",
      focus: wd.focus ?? "",
      estimatedDurationMinutes: wd.estimatedDurationMinutes ?? 0,
      status: wd.status,
      completedAt: wd.completedAt,
      exercises: wd.exercises.map((ex) => ({
        order: ex.order,
        exerciseId: ex.exerciseId.toString(),
        exerciseTitle: ex.exerciseTitle,
        exerciseImage: ex.exerciseImage,
        sets: ex.sets,
        reps: ex.reps ?? 0,
        restSeconds: ex.restSeconds,
        notes: ex.notes ?? "",
        status: ex.status ?? "PENDING",
        startedAt: ex.startedAt,
        timeTakenSeconds: ex.timeTakenSeconds,
      })),
    }));

    return {
      workoutPlanId: userDoc._id.toString(),
      days,
      planType: "custom",
      weekNumber: activeWeek.weekNumber,
      startDate: activeWeek.startDate,
      endDate: activeWeek.endDate,
      status: activeWeek.status,
      autoGenerated: false,
    };
  }

  async getWorkoutPlans(userId: string): Promise<WorkoutPlanResponseDto[]> {
    const userDoc = await this._userWorkoutPlanRepo.findByUserId(userId);
    if (!userDoc || userDoc.weeks.length === 0) return [];

    // Return all weeks sorted newest first
    const sortedWeeks = [...userDoc.weeks].sort((a, b) => b.weekNumber - a.weekNumber);

    return sortedWeeks.map((week) => ({
      workoutPlanId: userDoc._id.toString(),
      days: week.workoutDays.map((wd) => ({
        dayNumber: wd.dayNumber,
        day: wd.dayName,
        type: wd.type.toLowerCase() as "workout" | "rest",
        focus: wd.focus ?? "",
        estimatedDurationMinutes: wd.estimatedDurationMinutes ?? 0,
        status: wd.status,
        completedAt: wd.completedAt,
        exercises: wd.exercises.map((ex) => ({
          order: ex.order,
          exerciseId: ex.exerciseId.toString(),
          exerciseTitle: ex.exerciseTitle,
          exerciseImage: ex.exerciseImage,
          sets: ex.sets,
          reps: ex.reps ?? 0,
          restSeconds: ex.restSeconds,
          notes: ex.notes ?? "",
          status: ex.status ?? "PENDING",
          startedAt: ex.startedAt,
          timeTakenSeconds: ex.timeTakenSeconds,
        })),
      })),
      planType: "custom",
      weekNumber: week.weekNumber,
      startDate: week.startDate,
      endDate: week.endDate,
      status: week.status,
    }));
  }

  async markDayCompleted(userId: string, _planId: string, dayNumber: number, completed: boolean): Promise<WorkoutPlanResponseDto> {
    // Find the user's single document and locate the active week
    const userDoc = await this._userWorkoutPlanRepo.findByUserId(userId);
    if (!userDoc) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.WORKOUT_PLAN.NOT_FOUND);
    }

    const activeWeek = userDoc.weeks.find((w) => w.status === "ACTIVE");
    if (!activeWeek) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.WORKOUT_PLAN.NOT_FOUND);
    }

    const day = activeWeek.workoutDays.find((d) => d.dayNumber === dayNumber);
    if (!day) {
      throw new AppError(STATUS.NOT_FOUND, "Workout day not found");
    }

    // Update exercise statuses inline, then persist via repository
    day.status = completed ? "COMPLETED" : "PENDING";
    day.completedAt = completed ? new Date() : undefined;
    if (day.exercises && day.exercises.length > 0) {
      day.exercises.forEach((ex) => {
        ex.status = completed ? "COMPLETED" : "PENDING";
        if (completed && !ex.timeTakenSeconds) {
          ex.timeTakenSeconds = ex.durationSeconds ?? 60;
        }
      });
    }
    userDoc.markModified("weeks");
    await userDoc.save();

    return {
      workoutPlanId: userDoc._id.toString(),
      days: activeWeek.workoutDays.map((wd) => ({
        dayNumber: wd.dayNumber,
        day: wd.dayName,
        type: wd.type.toLowerCase() as "workout" | "rest",
        focus: wd.focus ?? "",
        estimatedDurationMinutes: wd.estimatedDurationMinutes ?? 0,
        status: wd.status,
        completedAt: wd.completedAt,
        exercises: wd.exercises.map((ex) => ({
          order: ex.order,
          exerciseId: ex.exerciseId.toString(),
          exerciseTitle: ex.exerciseTitle,
          exerciseImage: ex.exerciseImage,
          sets: ex.sets,
          reps: ex.reps ?? 0,
          durationSeconds: ex.durationSeconds,
          restSeconds: ex.restSeconds,
          notes: ex.notes ?? "",
          status: ex.status ?? "PENDING",
          startedAt: ex.startedAt,
          timeTakenSeconds: ex.timeTakenSeconds,
        })),
      })),
      planType: "custom",
      weekNumber: activeWeek.weekNumber,
      startDate: activeWeek.startDate,
      endDate: activeWeek.endDate,
      status: activeWeek.status,
    };
  }

  async markExerciseStatus(userId: string, _planId: string, dayNumber: number, exerciseId: string, status: WorkoutExerciseStatus): Promise<WorkoutPlanResponseDto> {
    const userDoc = await this._userWorkoutPlanRepo.findByUserId(userId);
    if (!userDoc) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.WORKOUT_PLAN.NOT_FOUND);
    }

    const activeWeek = userDoc.weeks.find((w) => w.status === "ACTIVE");
    if (!activeWeek) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.WORKOUT_PLAN.NOT_FOUND);
    }

    const day = activeWeek.workoutDays.find((d) => d.dayNumber === dayNumber);
    if (!day) {
      throw new AppError(STATUS.NOT_FOUND, "Workout day not found");
    }

    const exercise = day.exercises.find((e) => e.exerciseId.toString() === exerciseId);
    if (!exercise) {
      throw new AppError(STATUS.NOT_FOUND, "Exercise not found");
    }

    // Timer logic
    if (status === "ACTIVE") {
      exercise.startedAt = new Date();
    } else if (status === "COMPLETED") {
      if (exercise.startedAt) {
        const diffSeconds = Math.floor((Date.now() - exercise.startedAt.getTime()) / 1000);
        // Cap the maximum recorded time to 15 minutes (900 seconds) to prevent 
        // statistically impossible records if the user forgets to click "Done".
        const maxDuration = 900;
        exercise.timeTakenSeconds = Math.min(diffSeconds, maxDuration);
      } else {
        exercise.timeTakenSeconds = exercise.durationSeconds ?? 60;
      }
    }

    // Toggle completion on exercise
    exercise.status = status;

    // Check all COMPLETED or SKIPPED
    const allExercisesFinished = day.exercises.length > 0 && day.exercises.every(e => e.status === "COMPLETED" || e.status === "SKIPPED");

    day.status = allExercisesFinished ? "COMPLETED" : "PENDING";
    day.completedAt = allExercisesFinished ? new Date() : undefined;

    userDoc.markModified("weeks");
    await userDoc.save();

    return {
      workoutPlanId: userDoc._id.toString(),
      days: activeWeek.workoutDays.map((wd) => ({
        dayNumber: wd.dayNumber,
        day: wd.dayName,
        type: wd.type.toLowerCase() as "workout" | "rest",
        focus: wd.focus ?? "",
        estimatedDurationMinutes: wd.estimatedDurationMinutes ?? 0,
        status: wd.status,
        completedAt: wd.completedAt,
        exercises: wd.exercises.map((ex) => ({
          order: ex.order,
          exerciseId: ex.exerciseId.toString(),
          exerciseTitle: ex.exerciseTitle,
          exerciseImage: ex.exerciseImage,
          sets: ex.sets,
          reps: ex.reps ?? 0,
          restSeconds: ex.restSeconds,
          notes: ex.notes ?? "",
          status: ex.status ?? "PENDING",
          startedAt: ex.startedAt,
          timeTakenSeconds: ex.timeTakenSeconds,
        })),
      })),
      planType: "custom",
      weekNumber: activeWeek.weekNumber,
      startDate: activeWeek.startDate,
      endDate: activeWeek.endDate,
      status: activeWeek.status,
    };
  }
}


