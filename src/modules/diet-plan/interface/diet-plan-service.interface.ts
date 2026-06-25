import { GetDietPlansResponseDto, DietPlanResponseDto } from "../dto/diet-plan.dto";

export interface IDietPlanService {
  generateDietPlan(userId: string): Promise<DietPlanResponseDto>;
  getDietPlans(userId: string): Promise<GetDietPlansResponseDto>;
}
