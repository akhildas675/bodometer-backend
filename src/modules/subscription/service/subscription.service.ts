import { ISubscriptionFeatureRepository } from "@/modules/subscription/interface/repository.interface/subscription.feature-repository.interface";
import { ISubscriptionPlanRepository } from "@/modules/subscription/interface/repository.interface/subscription-plan.repository";
import { ISubscriptionTransactionRepository } from "../interface/repository.interface/subscription.transaction-repository.interface";
import { IUserSubscriptionRepository } from "@/modules/subscription/interface/repository.interface/user.subscription.repository.interface";
import { IAnswerRepository } from "@/modules/onboarding/interface/repository.interface/answer-repository.interface";
import { IPaymentService } from '@/modules/payment/interface/stripe-service.interface';
import { IWorkoutPlanService } from "../../workout-plan/interface/workout-plan-service.interface";

import { ISubscriptionService } from "../interface/subscription-interface.service";
import {
  CreateSubscriptionFeatureDto,
  GetAllSubscriptionFeaturesResponseDto,
  SubscriptionFeatureDto,
  SubscriptionFeatureQueryDto,
  ToggleSubscriptionFeatureStatusResponseDto,
  UpdateSubscriptionFeatureDto,
  ActiveSubscriptionDto,
  CreateSubscriptionPlanDto,
  GetAllSubscriptionPlansResponseDto,
  GetAllSubscriptionTransactionsResponseDto,
  GetSubscriptionPlanByIdResponseDto,
  SubscriptionPlanQueryDto,
  SubscriptionTransactionDto,
  SubscriptionTransactionQueryDto,
  ToggleSubscriptionPlanStatusResponseDto,
  UpdateSubscriptionPlanDto,
} from "../dto/subscription.dto";
import { SubscriptionMapper } from "../mapper/subscription.mapper";
import {
  SubscriptionFeature,
  SubscriptionPlan,
  SubscriptionPlanQuery,
} from "@/modules/subscription/interface/subscription.interface";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import { Role, ROLES } from "@/constants/constant.values.ts/roles";
import Stripe from "stripe";
import { PLAN_TYPE } from "@/constants/constant.values.ts/fitness.constant";
import { PaginationMeta } from '@/modules/base/interface/common.interface';
import { inject, injectable } from "inversify";
import { SUBSCRIPTION_TYPES } from "../subscription.types";

@injectable()
export class SubscriptionService implements ISubscriptionService {
  constructor(
    @inject(SUBSCRIPTION_TYPES.SubscriptionPlanRepository)
    private _subscriptionPlanRepository: ISubscriptionPlanRepository,
    @inject(SUBSCRIPTION_TYPES.SubscriptionFeatureRepository)
    private _subscriptionFeatureRepository: ISubscriptionFeatureRepository,
    @inject(SUBSCRIPTION_TYPES.SubscriptionTransactionRepository)
    private _subscriptionTransactionRepository: ISubscriptionTransactionRepository,
    @inject(SUBSCRIPTION_TYPES.UserSubscriptionRepository)
    private _userSubscriptionTransactionRepository: IUserSubscriptionRepository,
    @inject(SUBSCRIPTION_TYPES.AnswerRepository)
    private _answerRepository: IAnswerRepository,
    @inject(SUBSCRIPTION_TYPES.PaymentService)
    private _paymentService: IPaymentService,
    @inject(SUBSCRIPTION_TYPES.WorkoutPlanService)
    private _workoutPlanService: IWorkoutPlanService,
  ) {}


  // FEATURES METHODS


  async getAllSubscriptionFeatures(
    query: SubscriptionFeatureQueryDto,
  ): Promise<GetAllSubscriptionFeaturesResponseDto> {
    const { data, pagination } =
      await this._subscriptionFeatureRepository.getAllSubscriptionFeatures({
        search: query.search,
        page: query.page,
        limit: query.limit,
      });

    return {
      data: SubscriptionMapper.toFeatureDtoList(data),
      pagination,
    };
  }

  async createSubscriptionFeature(
    data: CreateSubscriptionFeatureDto,
  ): Promise<void> {
    const generateFeatureKey = (title: string) => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
    };

    const featureData: SubscriptionFeature = {
      key: generateFeatureKey(data.title),
      title: data.title,
      description: data.description,
      type: data.type,
    };

    await this._subscriptionFeatureRepository.createSubscriptionFeature(
      featureData,
    );
  }

  async updateSubscriptionFeature(
    data: UpdateSubscriptionFeatureDto,
    subscriptionFeatureId: string,
  ): Promise<void> {
    if (!subscriptionFeatureId) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.VALIDATION?.ID_REQUIRED ||
          "Subscription Feature ID is required",
      );
    }

    const updated =
      await this._subscriptionFeatureRepository.updateSubscriptionFeature(
        subscriptionFeatureId,
        {
          title: data.title,
          description: data.description,
          type: data.type,
        },
      );

    if (!updated) {
      throw new AppError(
        STATUS.INTERNAL_ERROR,
        MESSAGES.SUBSCRIPTION_PLAN.SUBSCRIPTION_FEATURE_CREATION_FAILED,
      );
    }
  }

  async toggleSubscriptionFeatureStatus(
    subscriptionFeatureId: string,
  ): Promise<ToggleSubscriptionFeatureStatusResponseDto> {
    const updated =
      await this._subscriptionFeatureRepository.toggleSubscriptionFeatureStatus(
        subscriptionFeatureId,
      );
    if (!updated) {
      throw new AppError(
        STATUS.INTERNAL_ERROR,
        MESSAGES.SUBSCRIPTION_PLAN.SUBSCRIPTION_FEATURE_CREATION_FAILED,
      );
    }
    return {
      message: MESSAGES.SUBSCRIPTION_PLAN.SUBSCRIPTION_FEATURE_STATUS_TOGGLED,
      feature: SubscriptionMapper.toFeatureDto(updated),
    };
  }

  async getSubscriptionFeatureById(
    subscriptionFeatureId: string,
  ): Promise<SubscriptionFeatureDto> {
    const feature =
      await this._subscriptionFeatureRepository.getSubscriptionFeatureById(
        subscriptionFeatureId,
      );
    if (!feature) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.SUBSCRIPTION_PLAN.SUBSCRIPTION_FEATURE_CREATION_FAILED,
      );
    }
    return SubscriptionMapper.toFeatureDto(feature);
  }


  // PLANS METHODS


  async createSubscriptionPlan(data: CreateSubscriptionPlanDto): Promise<void> {
    const planData = data as SubscriptionPlan;
    await this._subscriptionPlanRepository.createSubscriptionPlan(planData);
  }

  async getSubscriptionPlanById(
    subscriptionPlanId: string,
  ): Promise<GetSubscriptionPlanByIdResponseDto> {
    const plan =
      await this._subscriptionPlanRepository.getSubscriptionPlanById(
        subscriptionPlanId,
      );
    if (!plan) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.SUBSCRIPTION_PLAN.NOT_FOUND,
      );
    }
    return SubscriptionMapper.toPlanByIdResponseDto(plan);
  }

  async updateSubscriptionPlan(
    data: UpdateSubscriptionPlanDto,
    subscriptionPlanId: string,
  ): Promise<void> {
    if (!subscriptionPlanId) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION?.ID_REQUIRED);
    }
    const updated =
      await this._subscriptionPlanRepository.updateSubscriptionPlan(
        subscriptionPlanId,
        data,
      );
    if (!updated) {
      throw new AppError(
        STATUS.INTERNAL_ERROR,
        MESSAGES.SUBSCRIPTION_PLAN.SUBSCRIPTION_PLAN_UPDATE_FAILED,
      );
    }
  }

  async toggleSubscriptionPlanStatus(
    subscriptionPlanId: string,
  ): Promise<ToggleSubscriptionPlanStatusResponseDto> {
    const updated =
      await this._subscriptionPlanRepository.toggleSubscriptionPlanStatus(
        subscriptionPlanId,
      );
    if (!updated) {
      throw new AppError(
        STATUS.INTERNAL_ERROR,
        MESSAGES.SUBSCRIPTION_PLAN.SUBSCRIPTION_PLAN_TOGGLE_FAILED,
      );
    }
    return {
      plan: SubscriptionMapper.toPlanDto(updated),
    };
  }

  async getSubscriptionPlans(
    query: SubscriptionPlanQueryDto,
    role: Role,
  ): Promise<GetAllSubscriptionPlansResponseDto> {
    const planQuery = query as SubscriptionPlanQuery;

    if (role === ROLES.USER) {
      planQuery.isActive = true;
    }

    const { data, pagination } =
      await this._subscriptionPlanRepository.getSubscriptionPlans(planQuery);

    return {
      data: SubscriptionMapper.toPlanDtoList(data),
      pagination,
    };
  }

  async getAllSubscriptionTransactions(
    query: SubscriptionTransactionQueryDto,
  ): Promise<GetAllSubscriptionTransactionsResponseDto> {
    const { data, pagination } =
      await this._subscriptionTransactionRepository.findAllPaginated(query);

    return {
      data: SubscriptionMapper.toTransactionDtoList(data),
      pagination,
    };
  }

  async createCheckoutSession(
    userId: string,
    subscriptionPlanId: string,
  ): Promise<{ checkoutUrl: string }> {
    const activeSub =
      await this._userSubscriptionTransactionRepository.findActiveByUserId(
        userId,
      );
    if (activeSub) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.SUBSCRIPTION_PLAN.ALREADY_SUBSCRIBED,
      );
    }

    const plan =
      await this._subscriptionPlanRepository.getSubscriptionPlanById(
        subscriptionPlanId,
      );
    if (!plan) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.SUBSCRIPTION_PLAN.NOT_FOUND,
      );
    }

    const result = await this._paymentService.createCheckoutSession({
      planName: plan.name,
      description: plan.description ?? "Bodometer Premium Access",
      amount: Number(plan.price),
      currency: "inr",
      successUrl: `${process.env.CLIENT_URL}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.CLIENT_URL}/subscription-cancel`,
      metadata: {
        userId,
        subscriptionPlanId,
      },
    });

    return { checkoutUrl: result.url };
  }

  async verifyPaymentAndSave(
    userId: string,
    sessionId: string,
  ): Promise<ActiveSubscriptionDto> {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.VALIDATION.PAYMENT_NOT_COMPLETED,
      );
    }

    const sessionUserId = session.metadata?.userId;
    if (sessionUserId !== userId) {
      throw new AppError(
        STATUS.FORBIDDEN,
        MESSAGES.VALIDATION.SESSION_USER_MISMATCH,
      );
    }

    const subscriptionPlanId = session.metadata?.subscriptionPlanId;
    if (!subscriptionPlanId) {
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
      await this._subscriptionPlanRepository.getSubscriptionPlanById(
        subscriptionPlanId,
      );
    if (!plan) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.SUBSCRIPTION_PLAN.NOT_FOUND,
      );
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (plan.durationInDays ?? 30));

    const userSubscription =
      await this._userSubscriptionTransactionRepository.create({
        userId,
        subscriptionPlanId,
        startDate,
        endDate,
      });

    await this._subscriptionTransactionRepository.create({
      userId,
      subscriptionPlanId,
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

    const userAnswers = await this._answerRepository.getUserAnswers(userId);

    if (userAnswers && userAnswers.completed) {
      const existingPlans = await this._workoutPlanService.getWorkoutPlans(
        userId
      );
      const hasActivePremium = existingPlans.plans.some(
        (p) => p.status === "active" && p.planType === PLAN_TYPE.PREMIUM,
      );
      if (!hasActivePremium) {
        await this._workoutPlanService.generateWorkout(
          userId
        );
      }
    }

    return {
      subscriptionId: String(userSubscription._id),
      subscriptionPlanId,
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
      await this._userSubscriptionTransactionRepository.findActiveByUserId(
        userId,
      );
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
      subscriptionPlanId: plan?._id ? String(plan._id) : "",
      planName: plan?.name ?? "Unknown",
      startDate: sub.startDate,
      endDate: sub.endDate,
      status: sub.status,
      daysRemaining,
    };
  }

  async getUserTransactions(
    userId: string,
    query: SubscriptionTransactionQueryDto,
  ): Promise<{
    data: SubscriptionTransactionDto[];
    pagination: PaginationMeta;
  }> {
    const { data, pagination } =
      await this._subscriptionTransactionRepository.findUserTransactionsPaginated(
        userId,
        query,
      );

    return {
      data: SubscriptionMapper.toTransactionDtoList(data),
      pagination,
    };
  }
}
