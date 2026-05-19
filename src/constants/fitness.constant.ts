

export const FITNESS_GOAL = {
  MUSCLE_GAIN: "muscle_gain",
  FAT_LOSS: "fat_loss",
  ENDURANCE: "endurance",
  FLEXIBILITY: "flexibility",
  BODY_RECOMPOSITION: "body_recomposition",
  STAMINA: "stamina_and_energy",
  GENERAL_FITNESS: "general_fitness",
  STRESS_RELIEF: "stress_relief",
} as const;

export type FitnessGoal =
  typeof FITNESS_GOAL[keyof typeof FITNESS_GOAL];

export const PREFERRED_WORKOUT_TIME = {
  EARLY_MORNING: "early_morning",
  LATE_MORNING: "late_morning",
  AFTERNOON: "afternoon",
  EVENING: "evening",
  LATE_NIGHT: "late_night",
  FLEXIBLE: "flexible",
} as const;

export type PreferredWorkoutTime =
  typeof PREFERRED_WORKOUT_TIME[keyof typeof PREFERRED_WORKOUT_TIME];

export const FITNESS_LEVEL = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
} as const;

export type FitnessLevel =
  typeof FITNESS_LEVEL[keyof typeof FITNESS_LEVEL];

export const GOAL_INTENSITY = [
  "easy",
  "moderate",
  "challenging",
  "intense",
] as const;

export type GoalIntensity = (typeof GOAL_INTENSITY)[number];


export const UNITS = {
  METRIC: "metric",
  IMPERIAL: "imperial",
}
export type Unit = typeof UNITS[keyof typeof UNITS]