export interface MealMacroEstimate {
  correctedMeal: string;
  estimatedCalories: number;
  estimatedProtein: number;
  estimatedCarbs: number;
  estimatedFat: number;
}

export interface IMealService {
  estimateMealMacros(description: string): Promise<MealMacroEstimate>;
  estimateBatchMealMacros(descriptions: string[]): Promise<MealMacroEstimate[]>;
}
