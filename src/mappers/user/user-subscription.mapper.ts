import { GetSubscriptionsResponseDto } from "@/dto/admin/admin.dto";
import { ActiveSubscriptionDto } from "@/dto/user/user.dto";
import { Subscription } from "@/interfaces/admin/admin.interface";
import { SubscriptionTransaction } from "@/interfaces/subscription/subscription.interface";


export class UserSubscriptionMapper {
  static toResponseDto(sub: Subscription): GetSubscriptionsResponseDto {
    return {
      id: sub.id!,
      subscriptionName: sub.subscriptionName,
      description: sub.description,
      price: sub.price,
      durationDays: sub.durationDays,
      features: sub.features,
      liveSessionCount: sub.liveSessionCount,
      planType: sub.planType,
    };
  }

  static toResponseDtoList(subs: Subscription[]): GetSubscriptionsResponseDto[] {
    return subs.map((s) => this.toResponseDto(s));
  }

  static toActiveSubscriptionDto(
    transaction: SubscriptionTransaction,
    subscriptionName: string,
    planType: string,
  ): ActiveSubscriptionDto {
    const now = new Date();
    const endDate = transaction.endDate!;
    const daysRemaining = Math.max(
      0,
      Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );
    return {
      planId: transaction.planId,
      subscriptionName,
      planType: planType as ActiveSubscriptionDto["planType"],
      startDate: transaction.startDate!.toISOString(),
      endDate: endDate.toISOString(),
      daysRemaining,
    };
  }
}