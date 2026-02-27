export const GENDER = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
  PREFER_NOT_SAY: "prefer_not_say",
} as const;

export type Gender = (typeof GENDER)[keyof typeof GENDER];