import { z } from "zod";
import { GENDER } from "../../constants/identity.constants";
import { DIFFICULTY_LEVEL } from "../../constants/fitness.constant";



export const updateUserProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").optional(),
    userName: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .optional(),
    phoneNumber: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number must not exceed 15 digits")
      .nullable()
      .optional(),
    gender: z.nativeEnum(GENDER, { message: "Invalid gender" }).optional(),
    dateOfBirth: z.coerce.date().optional(),
  }),
});

export const uploadProfilePictureSchema = z.object({
  file: z
    .object({
      mimetype: z.string().refine(
        (val) => ["image/jpeg", "image/png", "image/webp"].includes(val),
        { message: "Only jpeg, png, and webp images are allowed" }
      ),
      size: z
        .number()
        .max(5 * 1024 * 1024, "File size must not exceed 5MB"),
    })
    .refine((file) => file !== undefined, { message: "File is required" }),
});

export const trainerIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Trainer ID is required"),
  })
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z.string().min(1, "New password is required"),
  })
});

export const categoryIdParamSchema = z.object({
  params: z.object({
    categoryId: z.string().min(1, "Category ID is required"),
  })
});

export const subscriptionIdParamSchema = z.object({
  params: z.object({
    subscriptionId: z.string().min(1, "Subscription ID is required"),
  })
});

export const checkoutSessionSchema = z.object({
  body: z.object({
    planId: z.string().min(1, "Plan ID is required"),
  })
});

export const verifyPaymentSchema = z.object({
  query: z.object({
    session_id: z.string().min(1, "Session ID is required"),
  })
});

export const groupIdParamSchema = z.object({
  params: z.object({
    groupId: z.string().min(1, "Group ID is required"),
  })
});

export const questionIdParamSchema = z.object({
  params: z.object({
    questionId: z.string().min(1, "Question ID is required"),
  })
});

export const submitOnboardingSchema = z.object({
  body: z.object({
    answers: z.array(
      z.object({
        questionId: z.string().min(1, "Question ID is required"),
        key: z.string().min(1, "Key is required"),
        value: z.union([
          z.string(),
          z.number(),
          z.boolean(),
          z.array(z.string()),
          z.array(z.number()),
        ]),
      }),
    ),
  }),
});

export const onboardingStatusParamSchema = z.object({
  params: z.object({
    onboardingStatusId: z.string().min(1, "Onboarding Status ID is required"),
  })
});

export const onboardingAnswersParamSchema = z.object({
  params: z.object({
    onboardingAnswersId: z.string().min(1, "Onboarding Answers ID is required"),
  })
});

export const onboardingAnswerUpdateSchema = z.object({
  body: z.object({
    answers: z.array(z.object({
      questionId: z.string().min(1, "Question ID is required"),
      answer: z.string().min(1, "Answer is required"),
    })),
  })
});

export const onboardingAnswerQuestionIdParamSchema = z.object({
  params: z.object({
    questionId: z.string().min(1, "Question ID is required"),
  })
});

export const bmiCalculationSchema = z.object({
  body: z.object({
    height: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number().positive().optional()),
    weight: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number().positive().optional()),
    unit: z.enum(["metric", "imperial"]),
    heightFt: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number().nonnegative().optional()),
    heightIn: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number().nonnegative().optional()),
  })
});

export const exerciseQuerySchema = z.object({
  query: z.object({
    page: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number().min(1).optional()),
    limit: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number().min(1).optional()),
    search: z.string().optional(),
    difficulty: z.nativeEnum(DIFFICULTY_LEVEL).optional(),
    targetMuscleId: z.string().optional(),
    categoryId: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  })
});