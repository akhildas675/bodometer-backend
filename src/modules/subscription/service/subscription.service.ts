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
  UpgradePreviewDto,
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

import { USER_TYPES } from "@/modules/user/user.types";
import { IUserRepository } from "@/modules/user/interface/user-repository.interface";

import { NOTIFICATION_TYPES } from "@/modules/notification/notification.types";
import { INotificationService } from "@/modules/notification/interface/notification-service.interface";
import { NOTIFICATION_ENTITY_TYPE, NOTIFICATION_TYPE } from "@/modules/notification/constant/notification.constant";

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
    @inject(NOTIFICATION_TYPES.NotificationService)
    private _notificationService: INotificationService,
    @inject(USER_TYPES.UserRepository)
    private _userRepository: IUserRepository,
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

    const action = session.metadata?.action;
    if (action === "UPGRADE") {
      const oldPlanId = session.metadata?.oldPlanId;
      const userSubscriptionId = session.metadata?.userSubscriptionId;
      const oldPlanUnusedValue = Number(session.metadata?.oldPlanUnusedValue ?? 0);
      const upgradeAmount = Number(session.metadata?.upgradeAmount ?? 0);

      const activeSub =
        await this._userSubscriptionTransactionRepository.findActiveByUserId(
          userId,
        );
      const subIdToUpdate =
        userSubscriptionId || (activeSub ? String(activeSub._id) : null);

      if (!subIdToUpdate) {
        throw new AppError(
          STATUS.NOT_FOUND,
          "Active subscription to upgrade not found",
        );
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (plan.durationInDays ?? 30));

      await this._userSubscriptionTransactionRepository.update(subIdToUpdate, {
        subscriptionPlanId,
        startDate,
        endDate,
        status: "active",
      });

      await this._subscriptionTransactionRepository.create({
        userId,
        subscriptionPlanId,
        userSubscriptionId: subIdToUpdate,
        type: "UPGRADE",
        oldPlanId,
        oldPeriodStart: activeSub?.startDate,
        oldPeriodEnd: activeSub?.endDate,
        newPeriodStart: startDate,
        newPeriodEnd: endDate,
        oldPlanUnusedValue,
        upgradeAmount,
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
          action: "UPGRADE",
        },
      });

      const userDoc = await this._userRepository.findById(userId);

      this._notificationService
        .createNotification({
          recipientId: userId,
          type: NOTIFICATION_TYPE.SUBSCRIPTION_PURCHASED,
          entityType: NOTIFICATION_ENTITY_TYPE.SUBSCRIPTION,
          entityId: subIdToUpdate,
          variables: {
            userName: userDoc?.name || "User",
            planName: plan.name,
            endDate: endDate.toLocaleDateString(),
          },
        })
        .catch((err) => console.error("Notification error:", err));

      return {
        subscriptionId: subIdToUpdate,
        subscriptionPlanId,
        planName: plan.name,
        startDate,
        endDate,
        status: "active",
        daysRemaining: plan.durationInDays ?? 30,
      };
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
        type: "PURCHASE",
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

    const userDoc = await this._userRepository.findById(userId);

    this._notificationService.createNotification({
      recipientId: userId,
      type: NOTIFICATION_TYPE.SUBSCRIPTION_PURCHASED,
      entityType: NOTIFICATION_ENTITY_TYPE.SUBSCRIPTION,
      entityId: String(userSubscription._id),
      variables: {
        userName: userDoc?.name || "User",
        planName: plan.name,
        endDate: endDate.toLocaleDateString(),
      },
    }).catch((err) => console.error("Notification error:", err));

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

  private async calculateUpgradeProration(
    userId: string,
    targetPlanId: string,
  ) {
    const activeSub =
      await this._userSubscriptionTransactionRepository.findActiveByUserId(
        userId,
      );
    if (!activeSub) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        "No active subscription found to upgrade",
      );
    }

    const currentPlanId =
      typeof activeSub.subscriptionPlanId === "object" &&
      activeSub.subscriptionPlanId !== null &&
      "_id" in activeSub.subscriptionPlanId
        ? String((activeSub.subscriptionPlanId as { _id: unknown })._id)
        : String(activeSub.subscriptionPlanId);

    if (currentPlanId === targetPlanId) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        "You are already subscribed to this plan",
      );
    }

    const currentPlan =
      await this._subscriptionPlanRepository.getSubscriptionPlanById(
        currentPlanId,
      );
    const targetPlan =
      await this._subscriptionPlanRepository.getSubscriptionPlanById(
        targetPlanId,
      );

    if (!currentPlan || !targetPlan) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.SUBSCRIPTION_PLAN.NOT_FOUND,
      );
    }

    if (!targetPlan.isActive) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        "Target subscription plan is currently inactive",
      );
    }

    if (Number(targetPlan.price) <= Number(currentPlan.price)) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        "Target plan must be higher price/tier to upgrade",
      );
    }

    const now = new Date();
    const endDate = new Date(activeSub.endDate);
    const remainingMs = Math.max(0, endDate.getTime() - now.getTime());
    const remainingDays = Math.max(
      0,
      Math.ceil(remainingMs / (1000 * 60 * 60 * 24)),
    );

    const currentDurationDays = currentPlan.durationInDays || 30;
    const dailyRate = Number(currentPlan.price) / currentDurationDays;

    const oldPlanUnusedValue = Math.min(
      Number(currentPlan.price),
      Math.max(0, Math.round(dailyRate * remainingDays * 100) / 100),
    );

    const upgradeAmount = Math.max(
      0,
      Math.round((Number(targetPlan.price) - oldPlanUnusedValue) * 100) / 100,
    );

    return {
      activeSub,
      currentPlan,
      targetPlan,
      remainingDays,
      oldPlanUnusedValue,
      upgradeAmount,
    };
  }

  async getUpgradePreview(
    userId: string,
    targetPlanId: string,
  ): Promise<UpgradePreviewDto> {
    const {
      currentPlan,
      targetPlan,
      remainingDays,
      oldPlanUnusedValue,
      upgradeAmount,
    } = await this.calculateUpgradeProration(userId, targetPlanId);

    const currentPlanIdStr = String(
      currentPlan.subscriptionPlanId || (currentPlan as { _id?: unknown })._id,
    );
    const targetPlanIdStr = String(
      targetPlan.subscriptionPlanId || (targetPlan as { _id?: unknown })._id,
    );

    return {
      currentPlan: {
        id: currentPlanIdStr,
        name: currentPlan.name,
        price: Number(currentPlan.price),
        durationInDays: currentPlan.durationInDays || 30,
      },
      targetPlan: {
        id: targetPlanIdStr,
        name: targetPlan.name,
        price: Number(targetPlan.price),
        durationInDays: targetPlan.durationInDays || 30,
      },
      daysRemaining: remainingDays,
      oldPlanUnusedValue,
      upgradeAmount,
    };
  }

  async createUpgradeCheckoutSession(
    userId: string,
    targetPlanId: string,
  ): Promise<{ checkoutUrl: string | null; directSuccess?: boolean }> {
    const {
      activeSub,
      currentPlan,
      targetPlan,
      oldPlanUnusedValue,
      upgradeAmount,
    } = await this.calculateUpgradeProration(userId, targetPlanId);

    const targetPlanIdStr = String(
      targetPlan.subscriptionPlanId || (targetPlan as { _id?: unknown })._id,
    );
    const oldPlanIdStr = String(
      currentPlan.subscriptionPlanId || (currentPlan as { _id?: unknown })._id,
    );

    if (upgradeAmount <= 0) {
      const now = new Date();
      const newEndDate = new Date();
      newEndDate.setDate(
        newEndDate.getDate() + (targetPlan.durationInDays || 30),
      );

      await this._userSubscriptionTransactionRepository.update(
        String(activeSub._id),
        {
          subscriptionPlanId: targetPlanIdStr,
          startDate: now,
          endDate: newEndDate,
          status: "active",
        },
      );

      await this._subscriptionTransactionRepository.create({
        userId,
        subscriptionPlanId: targetPlanIdStr,
        userSubscriptionId: String(activeSub._id),
        type: "UPGRADE",
        oldPlanId: oldPlanIdStr,
        oldPeriodStart: activeSub.startDate,
        oldPeriodEnd: activeSub.endDate,
        newPeriodStart: now,
        newPeriodEnd: newEndDate,
        oldPlanUnusedValue,
        upgradeAmount: 0,
        amount: 0,
        currency: "INR",
        paymentMethod: "credit_balance",
        paymentGateway: "manual",
        transactionId: `UPGRADE_CREDIT_${Date.now()}`,
        paymentStatus: "success",
        paidAt: now,
        meta: {
          note: "Upgraded via 100% unused plan credit",
        },
      });

      return { checkoutUrl: null, directSuccess: true };
    }

    const result = await this._paymentService.createCheckoutSession({
      planName: `Upgrade to ${targetPlan.name}`,
      description: `Prorated upgrade from ${currentPlan.name} to ${targetPlan.name}`,
      amount: upgradeAmount,
      currency: "inr",
      successUrl: `${process.env.CLIENT_URL}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.CLIENT_URL}/subscription-cancel`,
      metadata: {
        action: "UPGRADE",
        userId,
        subscriptionPlanId: targetPlanIdStr,
        oldPlanId: oldPlanIdStr,
        userSubscriptionId: String(activeSub._id),
        oldPlanUnusedValue: String(oldPlanUnusedValue),
        upgradeAmount: String(upgradeAmount),
      },
    });

    return { checkoutUrl: result.url };
  }
}
