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
import { Timeframe, PLAN_TYPE } from "@/constants/fitness.constant";

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
import { IExerciseRepository } from "../../interfaces/repository-interface/exercise/exercise-repository.interface";
import { IEquipmentRepository } from "../../interfaces/repository-interface/equipment/equipment-repository.interface";
import { ExerciseMapper } from "../../mappers/exercise/exercise.mapper";
import { EquipmentMapper } from "../../mappers/equipment/equipment.mapper";
import { ITrainerBookingRepository } from "../../interfaces/repository-interface/trainer/trainer-booking.repository.interface";
import { ITrainerAvailabilityRepository } from "../../interfaces/repository-interface/trainer/trainer-availability.repository.interface";
import { GetSlotsQueryDto, GetBookingsQueryDto, CreateBookingDto, DynamicSlotDto } from "../../dto/trainer/trainer-booking.dto";
import { PopulatedTrainerBooking } from "../../interfaces/domain.interface/trainer-booking.interface";
import { BOOKING_STATUS } from "../../models/trainer-booking.model";
import { parseTime, formatTime, generateReference } from "../../utils/booking.utils";
import { ExerciseQueryDto, GetAllExercisesResponseDto, ExerciseDto } from "../../dto/exercise/exercise.dto";
import { WorkoutPlanDetailDto, WorkoutPlanResponseDto, GetWorkoutPlansResponseDto, WorkoutProgressResponseDto, MarkDayCompletedDto, MarkExerciseStatusDto } from "../../dto/workout/workout-plan.dto";
import { EquipmentQueryDto, GetAllEquipmentResponseDto } from "../../dto/equipment/equipment.dto";
import { MealCategoryQueryDto, GetAllMealCategoriesResponseDto } from "../../dto/meal.category/meal-category.dto";
import { IWorkoutPlanService } from "../../interfaces/service-interface/workout/workout-plan.service.interface";
import { IMealCategoryRepository } from "@/interfaces/repository-interface/meal.category/meal-category.repository";

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
    private _trainerBookingRepo: ITrainerBookingRepository,
    private _trainerAvailabilityRepo: ITrainerAvailabilityRepository,
    private _mealCategoryRepo: IMealCategoryRepository,
    private _workoutPlanService: IWorkoutPlanService,
  ) { }

  // Fetch user details
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

  // Update user profile
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

  // Upload profile picture
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

  // Change user password
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

  // Fetch all trainers
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

  // Fetch trainer details
  async getTrainerById(trainerId: string): Promise<TrainerDetailDto> {
    const data =
      await this._trainerProfileRepo.getTrainerByIdWithUser(trainerId);
    if (!data) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.TRAINER.NOT_FOUND);
    }

    const specializationIds = Array.isArray(data.profile.specializations)
      ? data.profile.specializations.map((spec: unknown) => String((spec as { _id?: mongoose.Types.ObjectId })._id || spec))
      : [];

    const relatedTrainers = await this._trainerProfileRepo.findRelatedTrainers(
      specializationIds,
      data.profile._id.toString(),
      4
    );

    return UserMappers.toTrainerDetailDto(data, relatedTrainers);
  }

  // Fetch all categories
  async getCategories(query: CategoryQuery): Promise<GetAllCategoriesResponse> {
    return this._categoryRepo.getAllCategories({
      ...query,
      isActive: true,
    } as CategoryQuery);
  }

  // Fetch category details
  async getCategoryById(id: string): Promise<CategoryDetailDto> {
    const category = await this._categoryRepo.getCategoryById(id);
    if (!category) throw new AppError(STATUS.NOT_FOUND, MESSAGES.ADMIN.CATEGORY_NOT_FOUND);
    return CategoryMappers.toCategoryDetailDto(category);
  }

  // Fetch all equipment
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

  // Fetch all meal categories
  async getMealCategories(query: MealCategoryQueryDto): Promise<GetAllMealCategoriesResponseDto> {
    const { data, pagination } = await this._mealCategoryRepo.getAllMealCategories({
      ...query,
      isActive: true,
    } as MealCategoryQueryDto);

    return {
      data: data.map(item => ({
        mealCategoryId: item.mealCategoryId || "",
        title: item.title,
        description: item.description,
        isActive: item.isActive
      })),
      pagination,
    };
  }

  // Fetch user subscriptions
  async getMySubscriptions(): Promise<
    UserSubscriptionPlanResponseDto[] | null
  > {
    const plans = await this._subscriptionPlanRepository.getActiveSubscriptionPlans();
    if (!plans) return null;
    return SubscriptionMapper.toUserPlanResponseDtoList(plans);
  }

  // Create checkout session
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

  // Verify payment intent
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

    const onboardingStatus = await this.getOnboardingStatus(userId);
    if (onboardingStatus.completed) {
      const existingPlans = await this._workoutPlanService.getWorkoutPlans(userId, true, true);
      const hasActivePremium = existingPlans.plans.some(p => p.status === "active" && p.planType === PLAN_TYPE.PREMIUM);
      if (!hasActivePremium) {
        await this._workoutPlanService.generateWorkout(userId, PLAN_TYPE.PREMIUM).catch(err => {
          console.error("Failed to generate premium workout after payment:", err);
        });
      }
    }

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

  // Fetch active subscription
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

  // Build subscription DTO
  private async _buildActiveSubscriptionDto(
    userId: string,
  ): Promise<ActiveSubscriptionDto> {
    const sub = await this.getActiveSubscription(userId);
    if (!sub)
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.SUBSCRIPTION_PLAN.NO_ACTIVE_SUB);
    return sub;
  }

  // Fetch question groups
  async getOnboardingGroups(): Promise<GetAllQuestionGroupsResponse> {
    return this._groupRepo.getAllGroups({ limit: 100, isActive: true });
  }

  // Fetch onboarding questions
  async getOnboardingQuestions(): Promise<GetAllQuestionsResponse> {
    return this._questionRepo.getAllQuestions({ limit: 500, isActive: true });
  }

  // Submit onboarding answers
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

    const activeSub = await this.getActiveSubscription(userId);
    if (activeSub) {
      const existingPlans = await this._workoutPlanService.getWorkoutPlans(userId, true, true);
      const hasActivePremium = existingPlans.plans.some(p => p.status === "active" && p.planType === PLAN_TYPE.PREMIUM);
      if (!hasActivePremium) {
        await this._workoutPlanService.generateWorkout(userId, PLAN_TYPE.PREMIUM).catch(err => {
           console.error("Failed to generate premium workout after onboarding:", err);
        });
      }
    }
  }

  // Fetch onboarding status
  async getOnboardingStatus(userId: string): Promise<{ completed: boolean }> {
    const userAnswers = await this._answerRepo.getUserAnswers(userId);
    return { completed: userAnswers?.completed ?? false };
  }

  // Fetch onboarding answers
  async getOnboardingAnswers(
    userId: string,
  ): Promise<UserAnswerSubmission | null> {
    return this._answerRepo.getUserAnswers(userId);
  }

  // Fetch user transactions
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

  // Calculate user BMI
  async calculateBmi(data: UpdateBmiDto): Promise<UpdateBmiResponseDto> {
    return this._healthMetrics.bmiCalculator(data);
  }

  // Fetch all exercises
  async getExercises(query: ExerciseQueryDto): Promise<GetAllExercisesResponseDto> {
    const result = await this._exerciseRepo.getAllExercises({
      ...query,
    });

    return {
      data: ExerciseMapper.toExerciseDtoList(result.data),
      pagination: result.pagination,
    };
  }

  // Fetch exercise details
  async getExerciseById(id: string): Promise<ExerciseDto> {
    const exercise = await this._exerciseRepo.getExerciseById(id);
    if (!exercise) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.EXERCISE.NOT_FOUND);
    }

    return ExerciseMapper.toExerciseDto(exercise);
  }

  // Generate workout plan
  async generateWorkout(userId: string): Promise<WorkoutPlanDetailDto> {
    const activeSub = await this.getActiveSubscription(userId);
    const planType = activeSub ? PLAN_TYPE.PREMIUM : PLAN_TYPE.FREE;
    return this._workoutPlanService.generateWorkout(userId, planType);
  }

  // Fetch workout plans
  async getWorkoutPlans(userId: string): Promise<GetWorkoutPlansResponseDto> {
    const activeSub = await this.getActiveSubscription(userId);
    return this._workoutPlanService.getWorkoutPlans(userId, !!activeSub);
  }

  // Mark day completed
  async markDayCompleted(data: MarkDayCompletedDto): Promise<WorkoutPlanResponseDto> {
    return this._workoutPlanService.markDayCompleted(data);
  }

  // Mark exercise status
  async markExerciseStatus(data: MarkExerciseStatusDto): Promise<WorkoutPlanResponseDto> {
    return this._workoutPlanService.markExerciseStatus(data);
  }

  // Fetch workout progress
  async getWorkoutProgress(userId: string, timeframe?: Timeframe): Promise<WorkoutProgressResponseDto> {
    const activeSub = await this.getActiveSubscription(userId);
    return this._workoutPlanService.getWorkoutProgress(userId, timeframe, !!activeSub);
  }

  // --- TRAINER BOOKING (USER SIDE) ---

  async getAvailableSlots(trainerIdOrProfileId: string, query: GetSlotsQueryDto): Promise<DynamicSlotDto[]> {
    const from = query.from ? new Date(query.from) : new Date();
    from.setUTCHours(0, 0, 0, 0);
    const to = query.to ? new Date(query.to) : new Date(from);
    to.setDate(to.getDate() + 30);
    to.setUTCHours(0, 0, 0, 0);

    let trainerId = trainerIdOrProfileId;
    try {
      const profile = await this._trainerProfileRepo.findById(trainerIdOrProfileId);
      if (profile && profile.userId) {
        trainerId = profile.userId.toString();
      }
    } catch {
      // Ignore error if it's not a profile ID
    }

    const availabilities = await this._trainerAvailabilityRepo.findByTrainerId(trainerId);
    const activeAvailabilities = availabilities.filter(a => a.isActive);

    if (activeAvailabilities.length === 0) return [];

    const availableSlots: DynamicSlotDto[] = [];
    const uniqueDatesWithSlots = new Set<string>();

    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      if (uniqueDatesWithSlots.size >= 7) break;

      const currentDate = new Date(d);
      const dateStr = currentDate.toISOString().split('T')[0];
      let addedSlotForThisDate = false;

      const matchingRules = activeAvailabilities.filter(a =>
        currentDate >= a.startDate && currentDate <= a.endDate
      );

      for (const rule of matchingRules) {
        for (const tw of rule.timeWindows) {
          let currentStartMinutes = parseTime(tw.startTime);
          const endMinutes = parseTime(tw.endTime);

          while (currentStartMinutes + rule.sessionDuration <= endMinutes) {
            const slotStartMinutes = currentStartMinutes;
            const slotEndMinutes = currentStartMinutes + rule.sessionDuration;

            const startTimeStr = formatTime(slotStartMinutes);
            const endTimeStr = formatTime(slotEndMinutes);

            const slotStartDateTime = new Date(`${currentDate.toISOString().split('T')[0]}T${startTimeStr}:00`);
            if (slotStartDateTime <= new Date()) {
              currentStartMinutes += rule.sessionDuration;
              continue;
            }

            const hasOverlap = await this._trainerBookingRepo.hasOverlappingBooking(
              trainerId,
              currentDate,
              startTimeStr,
              endTimeStr
            );

            if (!hasOverlap) {
              availableSlots.push({
                date: dateStr,
                startTime: startTimeStr,
                endTime: endTimeStr,
              });
              addedSlotForThisDate = true;
            }

            currentStartMinutes += rule.sessionDuration;
          }
        }
      }

      if (addedSlotForThisDate) {
        uniqueDatesWithSlots.add(dateStr);
      }
    }

    return availableSlots;
  }

  async createBooking(userId: string, data: CreateBookingDto): Promise<PopulatedTrainerBooking> {
    const activeSub = await this._userSubscriptionRepository.findActiveByUserId(userId);
    if (!activeSub) {
      throw new AppError(STATUS.FORBIDDEN, "Only premium users can book trainers.");
    }

    let actualTrainerUserId = data.trainerId;
    let trainerProfile = await this._trainerProfileRepo.findByUserId(actualTrainerUserId);

    if (!trainerProfile) {
      try {
        const profileByDocId = await this._trainerProfileRepo.findById(actualTrainerUserId);
        if (profileByDocId) {
          actualTrainerUserId = profileByDocId.userId.toString();
          trainerProfile = profileByDocId;
        }
      } catch {
        // Ignore error if it's not a profile ID
      }
    }

    if (!trainerProfile || trainerProfile.verificationStatus !== "approved") {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.TRAINER.NOT_FOUND);
    }

    data.trainerId = actualTrainerUserId;

    const bookingDate = new Date(data.date);
    bookingDate.setUTCHours(0, 0, 0, 0);

    const slotStartDateTime = new Date(`${bookingDate.toISOString().split('T')[0]}T${data.startTime}:00`);
    if (slotStartDateTime <= new Date()) {
      throw new AppError(STATUS.BAD_REQUEST, "Cannot book a slot in the past.");
    }

    const hasOverlap = await this._trainerBookingRepo.hasOverlappingBooking(
      data.trainerId,
      bookingDate,
      data.startTime,
      data.endTime
    );
    if (hasOverlap) {
      throw new AppError(STATUS.CONFLICT, "This slot is no longer available or you already have a booking at this time.");
    }

    const bookingData = {
      userId,
      trainerId: data.trainerId,
      bookingReference: generateReference(),
      bookingType: data.bookingType || "ONLINE",
      bookingDate,
      startTime: data.startTime,
      endTime: data.endTime,
      status: BOOKING_STATUS.PENDING,
      userNotes: data.userNotes || "",
      statusUpdatedAt: new Date()
    };

    const newBooking = await this._trainerBookingRepo.create(bookingData);

    const populated = await this._trainerBookingRepo.findPopulatedById(newBooking._id);
    return populated!;
  }

  async getUserBookings(userId: string, query: GetBookingsQueryDto): Promise<{ data: PopulatedTrainerBooking[]; pagination: PaginationMeta }> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const date = query.date ? new Date(query.date) : undefined;

    const search = query.search;
    const sortBy = query.sortBy;
    const sortOrder = query.sortOrder;

    return this._trainerBookingRepo.findByUserIdPaginated(userId, page, limit, query.status, date, search, sortBy, sortOrder);
  }

  async cancelBookingByUser(userId: string, bookingId: string, reason?: string): Promise<PopulatedTrainerBooking> {
    if (!reason || reason.trim() === "") throw new AppError(STATUS.BAD_REQUEST, "Cancellation reason is required.");

    const booking = await this._trainerBookingRepo.findById(bookingId);
    if (!booking) throw new AppError(STATUS.NOT_FOUND, MESSAGES.TRAINER.BOOKING_NOT_FOUND);
    if (booking.userId.toString() !== userId) throw new AppError(STATUS.FORBIDDEN, MESSAGES.COMMON.ACCESS_DENIED);

    if (booking.status !== BOOKING_STATUS.PENDING && booking.status !== BOOKING_STATUS.APPROVED) {
      throw new AppError(STATUS.BAD_REQUEST, "Invalid state transition. Only PENDING or APPROVED bookings can be CANCELLED.");
    }

    const updated = await this._trainerBookingRepo.updateStatus(bookingId, {
      status: BOOKING_STATUS.CANCELLED,
      cancellationReason: reason,
      cancelledAt: new Date(),
      statusUpdatedAt: new Date()
    });
    return updated!;
  }
}
