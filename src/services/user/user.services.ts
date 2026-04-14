import {
  ActiveSubscriptionDto,
  ChangePasswordDto,
  CheckoutSessionResponseDto,
  CreateCheckoutSessionDto,
  FindUserResponseDto,
  GetTrainersQueryDto,
  GetUserWorkoutsQueryDto,
  GetWorkoutResponseDto,
  TrainerDetailDto,
  TrainerListResponseDto,
  UpdateUserProfileDto,
  UserWorkoutResponseDto,
  WorkoutDetailPageDto,
  WorkoutGoalsResponseDto,
  WorkoutTimeResponseDto,
} from "@/dto/user/user.dto";
import { UnifiedOnboardingDto } from "@/dto/user/user-onboarding.dto";
import { IUserRepository } from "@/interfaces/user/user-repository.interface";
import { IUserService } from "@/interfaces/user/user-service.interface";
import { UserMapper, UserMappers } from "@/mappers/user/user.mappers";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/statuscode";
import { IS3Service } from "@/interfaces/s3/s3-service.interface";
import { MESSAGES } from "@/constants/messages";
import { PaginationMeta } from "@/interfaces/admin/admin.interface";
import { IWorkoutRepository } from "@/interfaces/workout/workout-repository.interface";
import { ITrainerProfileRepository } from "@/interfaces/trainer/trainer.profile-repository.interface";
import {
  GetSubscriptionsResponseDto,
} from "@/dto/admin/admin.dto";
import { ISubscriptionRepository } from "@/interfaces/subscription/subscription-repository.interface";
import { ISubscriptionTransactionRepository } from "@/interfaces/subscription/subscription.transaction-repository.interface";
import Stripe from "stripe";
import { IStripeService } from "@/interfaces/payment/stripe-service.interface";
import { hashPassword } from "@/utils/password";
import bcrypt from "bcrypt";
import { UserSubscriptionMapper } from "@/mappers/user/user-subscription.mapper";
import { FITNESS_GOAL, PREFERRED_WORKOUT_TIME } from "@/constants/fitness.constant";
import { EXPERIENCE_DURATION, STRENGTH_LEVEL, TRAINING_TYPE, CONSISTENCY_LEVEL, WEEKLY_TRAINING_DAYS, AVG_SESSION_DURATION, GOAL_INTENSITY } from "@/constants/past-workouts.constant";

import { IFitnessProfileRepository } from "@/interfaces/user/fitness-profile-repository.interface";
import { IWorkoutHistoryRepository } from "@/interfaces/user/workout-history-repository.interface";
import { IMedicalProfileRepository } from "@/interfaces/user/medical-profile-repository.interface";
import { IDailyHabitsRepository } from "@/interfaces/user/daily-habits-repository.interface";


export class UserService implements IUserService {
  constructor(
    private _userRepo: IUserRepository,
    private _s3Service: IS3Service,
    private _workoutRepository: IWorkoutRepository,
    private _trainerProfileRepo: ITrainerProfileRepository,
    private _subscriptionRepository: ISubscriptionRepository,
    private _subscriptionTransactionRepo: ISubscriptionTransactionRepository,
    private _stripeService: IStripeService,
    private _fitnessProfileRepository: IFitnessProfileRepository,
    private _workoutHistoryRepository: IWorkoutHistoryRepository,
    private _medicalProfileRepository: IMedicalProfileRepository,
    private _dailyHabitsRepository: IDailyHabitsRepository,
    
  ) { }

  async fetchUser(userId: string): Promise<FindUserResponseDto> {
    const user = await this._userRepo.findById(userId);
    if (!user)
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.USER.USER_NOT_FOUND);
    return UserMapper.toFindUserResponse(user);
  }

  async updateProfile(
    userId: string,
    updateData: UpdateUserProfileDto,
  ): Promise<FindUserResponseDto> {
    if (Object.keys(updateData).length === 0) {
      throw new AppError(STATUS.BAD_REQUEST, "No fields to update");
    }
    if (updateData.gender && updateData.gender === "prefer_not_say") {
      throw new AppError(STATUS.BAD_REQUEST, "Please select a valid gender");
    }
    if (!updateData.dateOfBirth) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.COMMON.SELECT_CORRECT_DOB,
      );
    }
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
    const updatedUser = await this._userRepo.updateProfile(userId, updateData);
    if (!updatedUser)
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.USER.USER_NOT_FOUND);
    return UserMapper.toFindUserResponse(updatedUser);
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
      } catch (error) {
        console.error("Error deleting old profile picture:", error);
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
    if (!user) throw new AppError(STATUS.NOT_FOUND, MESSAGES.USER.USER_NOT_FOUND);

    const match = await bcrypt.compare(dto.currentPassword, user.password);
    if (!match) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.PASSWORD.INCORRECT_CURRENT_PASSWORD);

    const sameAsOld = await bcrypt.compare(dto.newPassword, user.password);
    if (sameAsOld) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.PASSWORD.NEW_PASSWORD_SAME_AS_OLD);

    const hashedPassword = await hashPassword(dto.newPassword);
    await this._userRepo.updatePassword(userId, hashedPassword);
  }

  async getWorkouts(
    query: GetUserWorkoutsQueryDto,
  ): Promise<{ data: UserWorkoutResponseDto[]; pagination: PaginationMeta }> {
    const page = query.page || 1;
    const limit = query.limit || 6;
    const { workouts, total } = await this._workoutRepository.getActiveWorkouts(
      page,
      limit,
      query.search,
      query.sortBy,
      query.sortOrder,
    );
    return UserMappers.toResponseDtoList(workouts, {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    });
  }


  async getWorkoutDetail(workoutId: string): Promise<WorkoutDetailPageDto> {
    const workout = await this._workoutRepository.getWorkoutById(workoutId);

    if (!workout || !workout.isActive) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.WORKOUT.NOT_FOUND);
    }

    const [trainers, relatedWorkouts] = await Promise.all([
      this._trainerProfileRepo.getTrainersBySpecialization(workoutId),
      this._workoutRepository.getRelatedWorkouts(workoutId, 3),
    ]);

    const result = UserMappers.toDetailDto(workout, trainers, relatedWorkouts);

    return result;
  }
  async getActiveSubscriptions(): Promise<GetSubscriptionsResponseDto[]> {
    const subs = await this._subscriptionRepository.findAllSubscriptions();
    const active = subs.filter((s) => s.isActive);
    return UserSubscriptionMapper.toResponseDtoList(active);
  }

  async getUserActiveSubscription(
    userId: string,
  ): Promise<ActiveSubscriptionDto | null> {
    const transaction =
      await this._subscriptionTransactionRepo.findActiveByUserId(userId);
    if (!transaction) return null;
    const plan = await this._subscriptionRepository.findSubscriptionById(
      transaction.planId,
    );
    if (!plan) return null;
    return UserSubscriptionMapper.toActiveSubscriptionDto(
      transaction,
      plan.subscriptionName,
      plan.planType,
    );
  }

  async createCheckoutSession(
    userId: string,
    dto: CreateCheckoutSessionDto,
  ): Promise<CheckoutSessionResponseDto> {
    const plan = await this._subscriptionRepository.findSubscriptionById(dto.planId);
    if (!plan || !plan.isActive) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.SUBSCRIPTION.NOT_FOUND);
    }

    const existing = await this._subscriptionTransactionRepo.findActiveByUserId(userId);
    if (existing) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.SUBSCRIPTION.ALREADY_ACTIVE);
    }

    const session = await this._stripeService.createCheckoutSession({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: plan.subscriptionName,
              description: plan.description,
            },
            unit_amount: plan.price * 100,
          },
          quantity: 1,
        },
      ],
      metadata: { userId, planId: dto.planId },
      success_url: `${process.env.CLIENT_URL}/subscriptions/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/subscriptions`,
    });

    await this._subscriptionTransactionRepo.createTransaction({
      userId,
      planId: dto.planId,
      gatewayOrderId: session.id,
      gatewayPaymentId: null,
      amount: plan.price,
      currency: "inr",
      paymentMethod: "stripe",
      paymentStatus: "pending",
      isRenewal: false,
      purchasedAt: null,
      startDate: null,
      endDate: null,
    });

    return { sessionId: session.id, url: session.url! };
  }

  async handleStripeWebhook(payload: Buffer, signature: string): Promise<void> {
    const event = this._stripeService.constructWebhookEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const planId = session.metadata?.planId;
      const plan = planId
        ? await this._subscriptionRepository.findSubscriptionById(planId)
        : null;

      const startDate = new Date();
      const endDate = new Date();
      if (plan) endDate.setDate(endDate.getDate() + plan.durationDays);

      await this._subscriptionTransactionRepo.updateByGatewayOrderId(session.id, {
        gatewayPaymentId: session.payment_intent as string,
        paymentStatus: "completed",
        purchasedAt: startDate,
        startDate,
        endDate,
      });
    }
  }

  async getTrainers(
    query: GetTrainersQueryDto,
  ): Promise<TrainerListResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 9;

    const { data, total } = await this._trainerProfileRepo.getApprovedTrainersPaginated(
      page,
      limit,
      query.search,
      query.sortBy,
      query.sortOrder,
      query.specializationId,
    );

    console.log("Trainer profile data...", data)

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
    const data = await this._trainerProfileRepo.getTrainerByIdWithUser(trainerId);
    console.log("Trainer data in user service details", data)
    if (!data) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.TRAINER.NOT_FOUND)
    }
    return UserMappers.toTrainerDetailDto(data)
  }

//premium user
  async getWorkoutTimes(): Promise<WorkoutTimeResponseDto> {
    return {
      workoutTimes: Object.values(PREFERRED_WORKOUT_TIME),
    };
  }
  async getWorkoutGoals(): Promise<WorkoutGoalsResponseDto> {
    return {
      fitnessGoals: Object.values(FITNESS_GOAL),
    };
  }

 

  async submitPremiumOnboarding(userId: string, data: UnifiedOnboardingDto): Promise<void> {
    try {
      // 1. Fitness Profile
      await this._fitnessProfileRepository.upsert({ userId }, {
        userId,
        fitnessGoals: data.fitnessProfile.fitnessGoals,
        preferredWorkoutTime: data.fitnessProfile.preferredWorkoutTime,
        preferredWorkoutCategories: data.fitnessProfile.preferredWorkoutCategories,
        fitnessLevel: "beginner", // or derive from history
      });

      // 2. Workout History
      await this._workoutHistoryRepository.upsert({ userId }, {
        userId,
        ...data.workoutHistory
      });

      // 3. Medical Profile Mapping
      const conditions = data.medicalProfile.medicalConditions || [];
      await this._medicalProfileRepository.upsert({ userId }, {
        userId,
        conditions: {
          hypertension: conditions.includes("High Blood Pressure"),
          diabetes: conditions.includes("Diabetes"),
          jointPain: conditions.includes("Joint / Back Pain"),
          heartIssue: conditions.includes("Heart / Breathing Issues"),
          other: conditions.find((c: string) => !["High Blood Pressure", "Diabetes", "Joint / Back Pain", "Heart / Breathing Issues"].includes(c)) || ""
        },
        medications: { taking: data.medicalProfile.takingMedication || false, notes: (data.medicalProfile.medications || [])[0] },
        injuries: { hasInjuries: data.medicalProfile.hasPastInjuries || false, notes: (data.medicalProfile.pastInjuries || [])[0] },
        allergies: { hasAllergies: data.medicalProfile.hasAllergies || false, notes: (data.medicalProfile.allergies || [])[0] },
        bmi: 0, heightCm: 0, weightKg: 0
      });

      // 4. Daily Habits Mapping
      const [sleepTime, wakeUpTime] = (data.dailyHabits.sleepDuration || "").split(" to ");
      const isCaffeine = (data.dailyHabits.smokingDrinking || "").includes("Caffeine: Yes");
      const isAlcohol = (data.dailyHabits.smokingDrinking || "").includes("Alcohol: Yes");
      const water = parseFloat(data.dailyHabits.waterIntake) || 0;
      const stepsMatch = (data.dailyHabits.workType || "").match(/\d+/);
      const steps = stepsMatch ? parseInt(stepsMatch[0]) : 0;

      await this._dailyHabitsRepository.upsert({ userId }, {
        userId,
        date: new Date(),
        wakeUpTime: wakeUpTime || "00:00",
        sleepTime: sleepTime || "00:00",
        mealsPerDay: parseInt(data.dailyHabits.dailyMeals) || 3,
        avgWaterLiters: water,
        avgDailySteps: steps,
        caffeine: isCaffeine,
        alcohol: isAlcohol
      });

    } catch (error) {
      console.error("Error saving onboarding data", error);
      throw new AppError(STATUS.INTERNAL_ERROR, "Failed to save onboarding data");
    }
  }

 async fetchWorkouts():Promise<GetWorkoutResponseDto[]>{
  const data = await this._workoutRepository.getAllWorkouts()

  return UserMappers.toWorkoutResponseList(data)
 }


}
