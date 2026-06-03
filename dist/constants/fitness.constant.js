"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TIMEFRAME = exports.WORKOUT_EXERCISE_STATUS = exports.WORKOUT_PLAN_STATUS = exports.WORKOUT_DAY_STATUS = exports.WORKOUT_DAY_TYPE_LOWER = exports.WORKOUT_DAY_TYPE = exports.WORKOUT_ENVIRONMENT = exports.DIFFICULTY_LEVEL = exports.BODY_REGION = exports.UNITS = exports.GOAL_INTENSITY = exports.FITNESS_LEVEL = exports.PREFERRED_WORKOUT_TIME = exports.FITNESS_GOAL = void 0;
exports.FITNESS_GOAL = {
    MUSCLE_GAIN: "muscle_gain",
    FAT_LOSS: "fat_loss",
    ENDURANCE: "endurance",
    FLEXIBILITY: "flexibility",
    BODY_RECOMPOSITION: "body_recomposition",
    STAMINA: "stamina_and_energy",
    GENERAL_FITNESS: "general_fitness",
    STRESS_RELIEF: "stress_relief",
};
exports.PREFERRED_WORKOUT_TIME = {
    EARLY_MORNING: "early_morning",
    LATE_MORNING: "late_morning",
    AFTERNOON: "afternoon",
    EVENING: "evening",
    LATE_NIGHT: "late_night",
    FLEXIBLE: "flexible",
};
exports.FITNESS_LEVEL = {
    BEGINNER: "beginner",
    INTERMEDIATE: "intermediate",
    ADVANCED: "advanced",
};
exports.GOAL_INTENSITY = [
    "easy",
    "moderate",
    "challenging",
    "intense",
];
exports.UNITS = {
    METRIC: "metric",
    IMPERIAL: "imperial",
};
exports.BODY_REGION = {
    UPPER_BODY: "upper_body",
    LOWER_BODY: "lower_body",
    FULL_BODY: "full_body",
    CORE: "core"
};
exports.DIFFICULTY_LEVEL = {
    BEGINNER: "beginner",
    INTERMEDIATE: "intermediate",
    ADVANCED: "advanced",
};
exports.WORKOUT_ENVIRONMENT = {
    HOME: "home",
    HOME_WITH_EQUIPMENT: "home_with_equipment",
    GYM: "gym",
    OUTDOOR: "outdoor",
};
exports.WORKOUT_DAY_TYPE = {
    WORKOUT: "WORKOUT",
    REST: "REST",
};
exports.WORKOUT_DAY_TYPE_LOWER = {
    WORKOUT: "workout",
    REST: "rest",
};
exports.WORKOUT_DAY_STATUS = {
    TODO: "TODO",
    COMPLETED: "COMPLETED",
    LOCKED: "LOCKED",
    SKIPPED: "SKIPPED",
    PENDING: "PENDING",
};
exports.WORKOUT_PLAN_STATUS = {
    ACTIVE: "ACTIVE",
    EXPIRED: "EXPIRED",
    COMPLETED: "COMPLETED",
};
exports.WORKOUT_EXERCISE_STATUS = {
    PENDING: "PENDING",
    ACTIVE: "ACTIVE",
    COMPLETED: "COMPLETED",
    SKIPPED: "SKIPPED",
};
exports.TIMEFRAME = {
    DAILY: "daily",
    WEEKLY: "weekly",
    MONTHLY: "monthly",
};
