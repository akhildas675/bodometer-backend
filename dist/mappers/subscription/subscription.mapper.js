"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionMapper = void 0;
class SubscriptionMapper {
    static toFeatureDto(feature) {
        return {
            subscriptionFeatureId: feature.subscriptionFeatureId,
            key: feature.key,
            title: feature.title,
            description: feature.description,
            type: feature.type,
            isActive: feature.isActive ?? false,
        };
    }
    static toFeatureDtoList(features) {
        return features.map((f) => this.toFeatureDto(f));
    }
    static toPlanDto(plan) {
        return {
            subscriptionPlanId: plan.subscriptionPlanId,
            name: plan.name,
            description: plan.description,
            price: plan.price,
            durationInDays: plan.durationInDays,
            isPopular: plan.isPopular,
            isActive: plan.isActive ?? true,
            features: plan.features.map((f) => ({
                featureId: f.featureId,
                limit: f.limit,
                limitType: f.limitType,
            })),
        };
    }
    static toPlanDtoList(plans) {
        return plans.map((p) => this.toPlanDto(p));
    }
    static toPlanByIdResponseDto(plan) {
        return {
            subscriptionPlanId: plan.subscriptionPlanId,
            name: plan.name,
            description: plan.description,
            price: plan.price,
            durationInDays: plan.durationInDays,
            isPopular: plan.isPopular,
            isActive: plan.isActive ?? true,
            features: plan.features.map((f) => ({
                featureId: f.featureId,
                limit: f.limit,
                limitType: f.limitType,
            })),
        };
    }
    static toUserPlanResponseDto(plan) {
        return {
            subscriptionPlanId: plan.subscriptionPlanId,
            name: plan.name,
            description: plan.description,
            price: plan.price,
            durationInDays: plan.durationInDays,
            features: plan.features.map((f) => ({
                featureId: f.featureId,
                title: f.title,
                limit: f.limit,
                limitType: f.limitType,
            })),
            isPopular: plan.isPopular,
            isActive: plan.isActive,
        };
    }
    static toUserPlanResponseDtoList(plans) {
        return plans.map((p) => this.toUserPlanResponseDto(p));
    }
    static toTransactionDto(tx) {
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
    static toTransactionDtoList(txList) {
        return txList.map((tx) => this.toTransactionDto(tx));
    }
}
exports.SubscriptionMapper = SubscriptionMapper;
