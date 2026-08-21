import mongoose from "mongoose";
import {
  SubscriptionFeatureDto,
  SubscriptionPlanDto,
  GetSubscriptionPlanByIdResponseDto,
  UserSubscriptionPlanResponseDto,
  SubscriptionTransactionDto,
} from "../dto/subscription.dto";
import {
  SubscriptionFeature,
  SubscriptionPlan,
} from "../interface/subscription.interface";

export interface PopulatedSubscriptionTransaction {
  _id: mongoose.Types.ObjectId;
  userId: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
  } | null;
  subscriptionPlanId: {
    _id: mongoose.Types.ObjectId;
    name: string;
  } | null;
  type?: string;
  oldPlanId?: {
    _id: mongoose.Types.ObjectId;
    name: string;
  } | null;
  oldPlanUnusedValue?: number;
  upgradeAmount?: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentGateway: string;
  transactionId?: string;
  paymentStatus: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class SubscriptionMapper {
  static toFeatureDto(feature: SubscriptionFeature): SubscriptionFeatureDto {
    return {
      subscriptionFeatureId: feature.subscriptionFeatureId!,
      key: feature.key,
      title: feature.title,
      description: feature.description,
      type: feature.type,
      isActive: feature.isActive ?? false,
    };
  }

  static toFeatureDtoList(features: SubscriptionFeature[]): SubscriptionFeatureDto[] {
    return features.map((f) => this.toFeatureDto(f));
  }

  static toPlanDto(plan: SubscriptionPlan): SubscriptionPlanDto {
    return {
      subscriptionPlanId: plan.subscriptionPlanId!,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      durationInDays: plan.durationInDays,
      isPopular: plan.isPopular,
      isActive: plan.isActive ?? true,
      features: plan.features.map((f) => ({
        featureId: f.featureId,
        title: f.title,
        limit: f.limit,
        limitType: f.limitType,
      })),
    };
  }

  static toPlanDtoList(plans: SubscriptionPlan[]): SubscriptionPlanDto[] {
    return plans.map((p) => this.toPlanDto(p));
  }

  static toPlanByIdResponseDto(plan: SubscriptionPlan): GetSubscriptionPlanByIdResponseDto {
    return {
      subscriptionPlanId: plan.subscriptionPlanId!,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      durationInDays: plan.durationInDays,
      isPopular: plan.isPopular,
      isActive: plan.isActive ?? true,
      features: plan.features.map((f) => ({
        featureId: f.featureId,
        title: f.title,
        limit: f.limit,
        limitType: f.limitType,
      })),
    };
  }

  static toUserPlanResponseDto(plan: SubscriptionPlan): UserSubscriptionPlanResponseDto {
    return {
      subscriptionPlanId: plan.subscriptionPlanId,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      durationInDays: plan.durationInDays,
      features: plan.features.map((f) => ({
        featureId: f.featureId,
        title: (f as { title?: string }).title,
        limit: f.limit,
        limitType: f.limitType,
      })),
      isPopular: plan.isPopular,
      isActive: plan.isActive,
    };
  }

  static toUserPlanResponseDtoList(plans: SubscriptionPlan[]): UserSubscriptionPlanResponseDto[] {
    return plans.map((p) => this.toUserPlanResponseDto(p));
  }

  static toTransactionDto(tx: PopulatedSubscriptionTransaction): SubscriptionTransactionDto {
    return {
      _id: tx._id.toString(),
      userId: tx.userId
        ? {
            _id: tx.userId._id.toString(),
            name: tx.userId.name,
            email: tx.userId.email,
          }
        : null,
      subscriptionPlanId: tx.subscriptionPlanId
        ? {
            _id: tx.subscriptionPlanId._id.toString(),
            name: tx.subscriptionPlanId.name,
          }
        : null,
      type: tx.type || "PURCHASE",
      oldPlanId: tx.oldPlanId
        ? {
            _id: tx.oldPlanId._id.toString(),
            name: tx.oldPlanId.name,
          }
        : null,
      oldPlanUnusedValue: tx.oldPlanUnusedValue ?? 0,
      upgradeAmount: tx.upgradeAmount ?? 0,
      amount: tx.amount,
      currency: tx.currency,
      paymentMethod: tx.paymentMethod,
      paymentGateway: tx.paymentGateway,
      transactionId: tx.transactionId,
      paymentStatus: tx.paymentStatus,
      paidAt: tx.paidAt,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
    };
  }

  static toTransactionDtoList(txList: PopulatedSubscriptionTransaction[]): SubscriptionTransactionDto[] {
    return txList.map((tx) => this.toTransactionDto(tx));
  }
}
