export const GENDER = {
  MALE: "male",
  FEMALE: "female",
  NOT_PREFER_TO_SAY: "not prefer to say",
} as const;

export type Gender = (typeof GENDER)[keyof typeof GENDER];