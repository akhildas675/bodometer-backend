import { DietWeekPlanResponse } from "@/services/ai-services/ai-diet.service";

export interface IAiDietService {
  generateDietPlan(userAnswers: Record<string, any>): Promise<DietWeekPlanResponse>;
}
