import {
  SubscriptionFeatureDto,
  SubscriptionPlanDto,
  GetSubscriptionPlanByIdResponseDto,
  UserSubscriptionPlanResponseDto,
} from "../../dto/subscription/subscription.dto";
import {
  SubscriptionFeature,
  SubscriptionPlan,
} from "../../interfaces/domain.interface/subscription.interface";

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
}
