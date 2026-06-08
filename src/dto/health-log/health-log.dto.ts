export interface MealEntryDto {
  mealCategoryId: string;
  description: string;
  correctedMeal?: string;
  estimatedCalories?: number;
  estimatedProtein?: number;
  estimatedCarbs?: number;
  estimatedFat?: number;
}

export interface HealthLogDto {
  userId: string;
  date: string;
  sleepHours?: number;
  waterLiters?: number;
  steps?: number;
  meals: MealEntryDto[];
  // Totals computed by the backend from all meals on this day
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface UpsertHealthLogDto {
  date: string;
  sleepHours?: number;
  waterLiters?: number;
  steps?: number;
  meals: MealEntryDto[];
}

// Each point in the trend charts – one entry per day/week/month
export interface HealthLogTrendDataDto {
  label: string;         // "Mon", "Week 1", "Jun"
  calories: number;
  protein: number;
  water: number;
  sleep: number;
  steps: number;
}

export interface MacroDistributionDto {
  macroName: string;
  amount: number;        // grams
  percentage: number;   // % of total macros
}

// Today's (or most-recent logged day's) actual values
export interface DailyNutritionSummaryDto {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface HealthLogProgressResponseDto {
  // Summary cards
  averageCalories: number;
  averageSleep: number;
  averageWater: number;
  averageSteps: number;
  averageProtein: number;
  currentStreak: number;

  // Chart series
  trendData: HealthLogTrendDataDto[];          // ordered oldest → newest

  // Pie chart
  macroDistribution: MacroDistributionDto[];

  // Daily Nutrition Summary section
  dailySummary: DailyNutritionSummaryDto | null;
}
