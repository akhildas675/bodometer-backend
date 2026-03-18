import {
  ActiveSubscriptionDto,
  CheckoutSessionResponseDto,
  CreateCheckoutSessionDto,
  FindUserResponseDto,
  GetTrainersQueryDto,
  GetUserWorkoutsQueryDto,
  TrainerListResponseDto,
  UpdateUserProfileDto,
  UserWorkoutResponseDto,
  WorkoutDetailPageDto,
} from "@/dto/user/user.dto";
import { IUserRepository } from "@/interfaces/user/user-repository.interface";
import { IUserService } from "@/interfaces/user/user-service.interface";
import { UserMapper, UserWorkoutMapper } from "@/mappers/user/user.mappers";
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
import { UserSubscriptionMapper } from "@/mappers/user/user-subscription.mapper";
import { IStripeService } from "@/interfaces/payment/stripe-service.interface";
import { UserTrainerMapper } from "@/mappers/user/user-trainer.mapper";

export class UserService implements IUserService {
  constructor(
    private _userRepo: IUserRepository,
    private _s3Service: IS3Service,
    private _workoutRepository: IWorkoutRepository,
    private _trainerProfileRepo: ITrainerProfileRepository,
    private _subscriptionRepository: ISubscriptionRepository,
    private _subscriptionTransactionRepo: ISubscriptionTransactionRepository,
    private _stripeService:IStripeService,
  ) {}

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
    return UserWorkoutMapper.toResponseDtoList(workouts, {
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
    return UserWorkoutMapper.toDetailDto(workout, trainers, relatedWorkouts);
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

  return {
    data: UserTrainerMapper.toListItemDtoArray(data),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
}
}
