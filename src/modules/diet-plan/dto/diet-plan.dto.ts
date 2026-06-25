export interface DietDayDto {
  dayNumber: number;
  day: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  recommendedFoods: string;
}

export interface DietPlanResponseDto {
  dietPlanId: string;
  startDate: Date;
  endDate: Date;
  status: string;
  days: DietDayDto[];
}

export interface GetDietPlansResponseDto {
  plans: DietPlanResponseDto[];
  canGenerate: boolean;
}
