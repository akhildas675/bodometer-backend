

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


export const BODY_REGION = {
  UPPER_BODY: "upper_body",
  LOWER_BODY: "lower_body",
  FULL_BODY: "full_body",
  CORE: "core"
} as const

export type BodyRegion = typeof BODY_REGION[keyof typeof BODY_REGION]


export const DIFFICULTY_LEVEL = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
} as const;

export type DifficultyLevel =
  (typeof DIFFICULTY_LEVEL)[keyof typeof DIFFICULTY_LEVEL];

export const WORKOUT_ENVIRONMENT = {
  HOME: "home",
  HOME_WITH_EQUIPMENT: "home_with_equipment",
  GYM: "gym",
  OUTDOOR: "outdoor",
} as const;

export type WorkoutEnvironment =
  (typeof WORKOUT_ENVIRONMENT)[keyof typeof WORKOUT_ENVIRONMENT];

export const WORKOUT_DAY_TYPE = {
  WORKOUT: "WORKOUT",
  REST: "REST",
} as const;

export type WorkoutDayType =
  (typeof WORKOUT_DAY_TYPE)[keyof typeof WORKOUT_DAY_TYPE];

export const WORKOUT_DAY_STATUS = {
  TODO: "TODO",
  COMPLETED: "COMPLETED",
  LOCKED: "LOCKED",
  SKIPPED: "SKIPPED",
  PENDING: "PENDING",
} as const;

export type WorkoutDayStatus =
  (typeof WORKOUT_DAY_STATUS)[keyof typeof WORKOUT_DAY_STATUS];

export const WORKOUT_PLAN_STATUS = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  COMPLETED: "COMPLETED",
} as const;

export type WorkoutPlanStatus =
  (typeof WORKOUT_PLAN_STATUS)[keyof typeof WORKOUT_PLAN_STATUS];

export const WORKOUT_EXERCISE_STATUS = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  SKIPPED: "SKIPPED",
} as const;

export type WorkoutExerciseStatus =
  (typeof WORKOUT_EXERCISE_STATUS)[keyof typeof WORKOUT_EXERCISE_STATUS];