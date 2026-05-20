
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

export type QuestionType =
    typeof QUESTION_TYPES[number];



export const CONDITION_OPERATORS = [
    "equals",
    "includes",
    "always"
] as const;

export type ConditionOperator =
    typeof CONDITION_OPERATORS[number];



export const DATA_SOURCES = [
    "category"
] as const;

export type DataSource =
    typeof DATA_SOURCES[number];


