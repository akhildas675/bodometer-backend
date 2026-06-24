export const ONBOARDING_TYPES = {
  QuestionRepository: Symbol.for("QuestionRepository"),
  GroupRepository: Symbol.for("GroupRepository"),
  AnswerRepository: Symbol.for("AnswerRepository"),
  Service: Symbol.for("OnboardingService"),
  Controller: Symbol.for("OnboardingController"),
};

export const QUESTION_TYPES = [
  "boolean",
  "single_select",
  "multi_select",
  "text",
  "number",
  "number_stepper",
  "time",
  "date"
] as const;

export type QuestionType = typeof QUESTION_TYPES[number];

export const CONDITION_OPERATORS = [
  "equals",
  "includes",
  "always"
] as const;

export type ConditionOperator = typeof CONDITION_OPERATORS[number];

export const DATA_SOURCES = [
  "category",
  "equipment"
] as const;

export type DataSource = typeof DATA_SOURCES[number];
