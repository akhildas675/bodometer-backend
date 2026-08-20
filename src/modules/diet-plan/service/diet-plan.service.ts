import mongoose from "mongoose";
import { AppError } from "../../../utils/appError";
import { STATUS } from "../../../constants/constant.values.ts/statuscode";

import { inject, injectable } from "inversify";
import { DIET_PLAN_TYPES } from "../diet-plan.types";
import { IDietPlanService } from "../interface/diet-plan-service.interface";
import { IUserDietPlanRepository } from "../interface/user-diet-plan-repository.interface";
import { IUserSubscriptionRepository } from "../../subscription/interface/repository.interface/user.subscription.repository.interface";
import { SUBSCRIPTION_TYPES } from "../../subscription/subscription.types";
import { IAnswerRepository } from "../../../modules/onboarding/interface/repository.interface/answer-repository.interface";
import { IAiDietService } from '@/modules/ai/interface/ai.diet-service.interface';
import { DietPlanResponseDto, GetDietPlansResponseDto } from "../dto/diet-plan.dto";
import { AI_TYPES } from "@/modules/ai/ai.types";

import { USER_TYPES } from "@/modules/user/user.types";
import { IUserRepository } from "@/modules/user/interface/user-repository.interface";

import { NOTIFICATION_TYPES } from "@/modules/notification/notification.types";
import { INotificationService } from "@/modules/notification/interface/notification-service.interface";
import { NOTIFICATION_ENTITY_TYPE, NOTIFICATION_TYPE } from "@/modules/notification/constant/notification.constant";

const generationLocks = new Set<string>();

@injectable()
export class DietPlanService implements IDietPlanService {
  constructor(
    @inject(DIET_PLAN_TYPES.UserDietPlanRepository) private _userDietPlanRepo: IUserDietPlanRepository,
    @inject(Symbol.for("AnswerRepository")) private _answerRepo: IAnswerRepository,
    @inject(SUBSCRIPTION_TYPES.UserSubscriptionRepository) private _userSubscriptionRepo: IUserSubscriptionRepository,
    @inject(NOTIFICATION_TYPES.NotificationService) private _notificationService: INotificationService,
    @inject(USER_TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(AI_TYPES.AiDietService) private _aiDietService: IAiDietService,
  ) {}

  private async getActiveSubscription(userId: string) {
    const subscription = await this._userSubscriptionRepo.findActiveByUserId(userId);
    return subscription ? true : false;
  }

  async generateDietPlan(userId: string): Promise<DietPlanResponseDto> {
    const hasActiveSub = await this.getActiveSubscription(userId);
    if (!hasActiveSub) {
      throw new AppError(STATUS.FORBIDDEN, "Diet plan generation is available for premium users only.");
    }

    if (generationLocks.has(userId)) {
      throw new AppError(STATUS.CONFLICT, "Diet plan generation is already in progress.");
    }
    generationLocks.add(userId);

    try {
      const onboardingAnswers = await this._answerRepo.getUserAnswers(userId);
      
      if (!onboardingAnswers || !onboardingAnswers.completed) {
        throw new AppError(STATUS.BAD_REQUEST, "Onboarding must be completed before generating a diet plan.");
      }

      const activePlan = await this._userDietPlanRepo.findActiveByUserId(userId);
      if (activePlan) {
        // In a real app we might archive it or just prevent generation
        // Let's just archive the old one by updating its status to 'completed'
        activePlan.status = "completed";
        await activePlan.save();
      }

      const answersMap: Record<string, string | string[]> = {};
      if (onboardingAnswers) {
        for (const ans of onboardingAnswers.answers) {
          if (ans.questionKey) {
            answersMap[ans.questionKey] = ans.answer as string | string[];
          }
        }
      }

      const aiResponse = await this._aiDietService.generateDietPlan(answersMap);

      if (!aiResponse.weekPlan || aiResponse.weekPlan.length === 0) {
        throw new AppError(STATUS.INTERNAL_ERROR, "Failed to generate diet plan from AI.");
      }

      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);

      const dietPlan = await this._userDietPlanRepo.create({
        userId: new mongoose.Types.ObjectId(userId),
        startDate,
        endDate,
        status: "active",
        days: aiResponse.weekPlan.map(day => ({
          dayNumber: day.dayNumber,
          day: day.day,
          calories: day.calories,
          protein: day.protein,
          carbs: day.carbs,
          fats: day.fats,
          recommendedFoods: day.recommendedFoods || "",
        })),
      });

      const result: DietPlanResponseDto = {
        dietPlanId: dietPlan._id.toString(),
        startDate: dietPlan.startDate,
        endDate: dietPlan.endDate,
        status: dietPlan.status,
        days: dietPlan.days.map((d) => ({
          dayNumber: d.dayNumber,
          day: d.day,
          calories: d.calories,
          protein: d.protein,
          carbs: d.carbs,
          fats: d.fats,
          recommendedFoods: d.recommendedFoods,
        })),
      };

      const userDoc = await this._userRepository.findById(userId);

      this._notificationService.createNotification({
        recipientId: userId,
        type: NOTIFICATION_TYPE.MEAL_PLAN_GENERATED,
        entityType: NOTIFICATION_ENTITY_TYPE.MEAL_PLAN,
        entityId: dietPlan._id.toString(),
        variables: {
          userName: userDoc?.name || "User",
        },
      }).catch((err: unknown) => console.error("Notification error:", err));

      return result;
    } finally {
      generationLocks.delete(userId);
    }
  }

  async getDietPlans(userId: string): Promise<GetDietPlansResponseDto> {
    const hasActiveSub = await this.getActiveSubscription(userId);
    
    if (!hasActiveSub) {
      return {
        plans: [],
        canGenerate: false,
      };
    }

    const plans = await this._userDietPlanRepo.findByUserId(userId);
    const activePlan = plans.find(p => p.status === "active");

    const mappedPlans: DietPlanResponseDto[] = plans.map(p => ({
      dietPlanId: p._id.toString(),
      startDate: p.startDate,
      endDate: p.endDate,
      status: p.status,
      days: p.days.map((d) => ({
        dayNumber: d.dayNumber,
        day: d.day,
        calories: d.calories,
        protein: d.protein,
        carbs: d.carbs,
        fats: d.fats,
        recommendedFoods: d.recommendedFoods,
      })),
    }));

    return {
      plans: mappedPlans,
      canGenerate: !activePlan,
    };
  }
}
