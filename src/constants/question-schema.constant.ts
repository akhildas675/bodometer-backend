export const SCHEMA_KEY_OPTIONS = [
  // FITNESS PROFILE
  { label: "Preferred Workouts",   value: "preferredWorkout",      section: "fitness",      group: "fitness_profile" },
  { label: "Fitness Goals",        value: "fitnessGoals",          section: "fitness",      group: "fitness_profile" },
  { label: "Workout Time",         value: "preferredWorkoutTime",  section: "fitness",      group: "fitness_profile" },
  { label: "Fitness Level",        value: "fitnessLevel",          section: "fitness",      group: "fitness_profile" },

  // WORKOUT HISTORY
  { label: "Experience Duration",  value: "experienceDuration",    section: "workout",      group: "workout_history" },
  { label: "Strength Level",       value: "strengthLevel",         section: "workout",      group: "workout_history" },
  { label: "Trained With Coach",   value: "trainedWithCoach",      section: "workout",      group: "workout_history" },
  { label: "Training Types",       value: "trainingTypes",         section: "workout",      group: "workout_history" },
  { label: "Consistency Level",    value: "consistencyLevel",      section: "workout",      group: "workout_history" },
  { label: "Weekly Training Days", value: "weeklyTrainingDays",    section: "workout",      group: "workout_history" },
  { label: "Session Duration",     value: "avgSessionDuration",    section: "workout",      group: "workout_history" },
  { label: "Goal Intensity",       value: "goalIntensity",         section: "workout",      group: "workout_history" },

  // MEDICAL - CONDITIONS
  { label: "Hypertension",         value: "conditions.hypertension", section: "medical",    group: "medical_conditions" },
  { label: "Diabetes",             value: "conditions.diabetes",     section: "medical",    group: "medical_conditions" },
  { label: "Joint Pain",           value: "conditions.jointPain",    section: "medical",    group: "medical_conditions" },
  { label: "Heart Issue",          value: "conditions.heartIssue",   section: "medical",    group: "medical_conditions" },
  { label: "Other Condition",      value: "conditions.other",        section: "medical",    group: "medical_conditions" },

  // MEDICAL - MEDICATIONS
  { label: "Taking Medication",    value: "medications.taking",    section: "medical",      group: "medical_medications" },
  { label: "Medication Notes",     value: "medications.notes",     section: "medical",      group: "medical_medications" },

  // MEDICAL - INJURIES
  { label: "Has Injuries",         value: "injuries.hasInjuries",  section: "medical",      group: "medical_injuries" },
  { label: "Injury Notes",         value: "injuries.notes",        section: "medical",      group: "medical_injuries" },

  // MEDICAL - ALLERGIES
  { label: "Has Allergies",        value: "allergies.hasAllergies",section: "medical",      group: "medical_allergies" },
  { label: "Allergy Notes",        value: "allergies.notes",       section: "medical",      group: "medical_allergies" },

  // BODY DATA
  { label: "Height (cm)",          value: "heightCm",              section: "medical",      group: "body_data" },
  { label: "Weight (kg)",          value: "weightKg",              section: "medical",      group: "body_data" },
  { label: "BMI",                  value: "bmi",                   section: "medical",      group: "body_data" },

  // DAILY HABITS
  { label: "Wake Up Time",         value: "wakeUpTime",            section: "daily_habits", group: "daily_habits" },
  { label: "Sleep Time",           value: "sleepTime",             section: "daily_habits", group: "daily_habits" },
  { label: "Meals Per Day",        value: "mealsPerDay",           section: "daily_habits", group: "daily_habits" },
  { label: "Water Intake",         value: "avgWaterLiters",        section: "daily_habits", group: "daily_habits" },
  { label: "Daily Steps",          value: "avgDailySteps",         section: "daily_habits", group: "daily_habits" },
  { label: "Caffeine",             value: "caffeine",              section: "daily_habits", group: "daily_habits" },
  { label: "Alcohol",              value: "alcohol",               section: "daily_habits", group: "daily_habits" },
];