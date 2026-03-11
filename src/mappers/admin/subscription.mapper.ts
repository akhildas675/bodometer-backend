import {
  CreateSubscriptionDTO,
  UpdateSubscriptionDTO,
  SubscriptionResponseDTO,
} from "@/dto/admin/admin.dto";
import { Subscription } from "@/interfaces/admin/admin.interface";

export class SubscriptionMapper {
  static fromCreateDTO(dto: CreateSubscriptionDTO): Subscription {
    return {
      subscriptionName: dto.subscriptionName,
      description: dto.description,
      price: dto.price,
      durationDays: dto.durationDays,
      features: dto.features,
      liveSessionCount: dto.liveSessionCount,
      planType: dto.planType,
      isActive: true,
    };
  }

  static fromUpdateDTO(dto: UpdateSubscriptionDTO): Partial<Subscription> {
    const partial: Partial<Subscription> = {};
    if (dto.subscriptionName !== undefined) partial.subscriptionName = dto.subscriptionName;
    if (dto.description !== undefined) partial.description = dto.description;
    if (dto.price !== undefined) partial.price = dto.price;
    if (dto.durationDays !== undefined) partial.durationDays = dto.durationDays;
    if (dto.features !== undefined) partial.features = dto.features;
    if (dto.liveSessionCount !== undefined) partial.liveSessionCount = dto.liveSessionCount;
    if (dto.planType !== undefined) partial.planType = dto.planType;
    return partial;
  }

  static toResponse(subscription: Subscription): SubscriptionResponseDTO {
    return {
      id: subscription.id!,
      subscriptionName: subscription.subscriptionName,
      description: subscription.description,
      price: subscription.price,
      durationDays: subscription.durationDays,
      features: subscription.features,
      liveSessionCount: subscription.liveSessionCount,
      planType: subscription.planType,
      isActive: subscription.isActive,
      createdAt: subscription.createdAt!,
    };
  }
}