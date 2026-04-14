import { Types } from "mongoose";

export interface UnifiedOnboardingDto {
  fitnessProfile: {
    fitnessGoals: string[];
    preferredWorkoutTime: string;
    preferredWorkoutCategories: string[];
  };
  workoutHistory: {
    experienceDuration: string;
    strengthLevel: string;
    trainedWithCoach: boolean;
    trainingTypes: string[];
    consistencyLevel: string;
    weeklyTrainingDays: string;
    avgSessionDuration: string;
    goalIntensity: string;
  };
  medicalProfile: {
    hasMedicalConditions: boolean;
    medicalConditions: string[];
    hasPastInjuries: boolean;
    pastInjuries: string[];
    hasAllergies: boolean;
    allergies: string[];
    takingMedication: boolean;
    medications: string[];
    bloodPressure: string;
    clearanceFromDoctor: boolean;
  };
  dailyHabits: {
    dietPreference: string;
    dailyMeals: string;
    waterIntake: string;
    sleepDuration: string;
    stressLevel: string;
    workType: string;
    smokingDrinking: string;
  };
}
