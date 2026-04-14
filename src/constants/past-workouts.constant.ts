//Experience Duration 

export const EXPERIENCE_DURATION = {
  NEW_0_1_MONTH: "new_0_1_month",
  M1_6:          "m1_6",
  M6_12:         "m6_12",
  Y1_3:          "y1_3",
  Y3_PLUS:       "y3_plus",
} as const;

export type ExperienceDuration = (typeof EXPERIENCE_DURATION)[keyof typeof EXPERIENCE_DURATION];

// Training Type

export const TRAINING_TYPE = {
  GYM:        "gym",
  BODYWEIGHT: "bodyweight",
  CARDIO:     "cardio",
  SPORTS:     "sports",
  YOGA:       "yoga",
  NONE:       "none",
} as const;

export type TrainingType = (typeof TRAINING_TYPE)[keyof typeof TRAINING_TYPE];

// Weekly Training Days 

export const WEEKLY_TRAINING_DAYS = {
  ZERO:      "0",
  ONE_TWO:   "1_2",
  THREE_FOUR:"3_4",
  FIVE_SIX:  "5_6",
  EVERYDAY:  "everyday",
} as const;

export type WeeklyTrainingDays = (typeof WEEKLY_TRAINING_DAYS)[keyof typeof WEEKLY_TRAINING_DAYS];

// Avg Session Duration

export const AVG_SESSION_DURATION = {
  LT_20:    "lt_20",
  MIN_20_40:"20_40",
  MIN_40_60:"40_60",
  PLUS_60:  "60_plus",
} as const;

export type AvgSessionDuration = (typeof AVG_SESSION_DURATION)[keyof typeof AVG_SESSION_DURATION];

// Strength Level 

export const STRENGTH_LEVEL = {
  STRUGGLE_BASIC:    "struggle_basic",
  BODYWEIGHT_OK:     "bodyweight_ok",
  WEIGHTS_CONFIDENT: "weights_confident",
  ADVANCED_HEAVY:    "advanced_heavy",
} as const;

export type StrengthLevel = (typeof STRENGTH_LEVEL)[keyof typeof STRENGTH_LEVEL];

// Consistency Level 

export const CONSISTENCY_LEVEL = {
  NEVER: "never",
  M1_3:  "m1_3",
  M3_6:  "m3_6",
  M6_12: "m6_12",
  YEARS: "years",
} as const;

export type ConsistencyLevel = (typeof CONSISTENCY_LEVEL)[keyof typeof CONSISTENCY_LEVEL];

// Goal Intensity 

export const GOAL_INTENSITY = {
  EASY:        "easy",
  MODERATE:    "moderate",
  CHALLENGING: "challenging",
  INTENSE:     "intense",
} as const;

export type GoalIntensity = (typeof GOAL_INTENSITY)[keyof typeof GOAL_INTENSITY];

//Fitness Goal

export const FITNESS_GOAL = {
  MUSCLE_GAIN:        "muscle_gain",
  FAT_LOSS:           "fat_loss",
  ENDURANCE:          "endurance",
  FLEXIBILITY:        "flexibility",
  BODY_RECOMPOSITION: "body_recomposition",
  STAMINA_AND_ENERGY: "stamina_and_energy",
  GENERAL_FITNESS:    "general_fitness",
  STRESS_RELIEF:      "stress_relief",
} as const;

export type FitnessGoal = (typeof FITNESS_GOAL)[keyof typeof FITNESS_GOAL];

// Fitness Level

export const FITNESS_LEVEL = {
  BEGINNER:     "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED:     "advanced",
} as const;

export type FitnessLevel = (typeof FITNESS_LEVEL)[keyof typeof FITNESS_LEVEL];

//Preferred Workout Time 

export const PREFERRED_WORKOUT_TIME = {
  EARLY_MORNING: "early_morning",
  LATE_MORNING:  "late_morning",
  AFTERNOON:     "afternoon",
  EVENING:       "evening",
  LATE_NIGHT:    "late_night",
  FLEXIBLE:      "flexible",
} as const;

export type PreferredWorkoutTime = (typeof PREFERRED_WORKOUT_TIME)[keyof typeof PREFERRED_WORKOUT_TIME];