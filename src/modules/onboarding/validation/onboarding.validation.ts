import { z } from "zod";
import { QUESTION_TYPES, CONDITION_OPERATORS, DATA_SOURCES } from "../onboarding.types";

export const groupValidationSchema = z.object({
  body: z.object({
    key: z.string().optional(),
    title: z.string().min(1, "Group title is required"),
    order: z.coerce.number().min(0, "Group order must be a non-negative number"),
  })
});

export const groupUpdateSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Group title is required").optional(),
    order: z.coerce.number().min(0, "Group order must be a non-negative number").optional(),
  })
});

export const groupIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Group ID is required"),
  })
});

export const questionValidationSchema = z.object({
  body: z.object({
    key: z.string().optional(),
    question: z.string().min(1, "Question text is required"),
    groupId: z.string().min(1, "Group ID is required"),
    order: z.coerce.number().min(1, "Order must be at least 1"),
    type: z.enum([...QUESTION_TYPES] as [typeof QUESTION_TYPES[number], ...typeof QUESTION_TYPES[number][]], { message: "Invalid question type" }),
    dataSource: z.enum(DATA_SOURCES).optional().nullable(),
    validation: z.object({
      required: z.boolean().optional(),
    }).optional(),
    next: z.array(z.object({
      condition: z.object({
        operator: z.enum(CONDITION_OPERATORS, { message: "Invalid condition operator" }),
        value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]).optional(),
      }),
      nextQuestionId: z.string().min(1, "Next question ID is required"),
    })).optional().nullable(),
    options: z.array(z.object({
      label: z.string().min(1, "Option label is required"),
      value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]).optional(),
    })).optional().nullable(),
    numberConfig: z.object({
      min: z.coerce.number().optional().nullable(),
      max: z.coerce.number().optional().nullable(),
      step: z.coerce.number().optional().nullable(),
      unit: z.string().optional().nullable(),
    }).optional().nullable(),
  })
});

export const questionUpdateSchema = z.object({
  body: z.object({
    key: z.string().optional(),
    question: z.string().min(1, "Question text is required").optional(),
    groupId: z.string().min(1, "Group ID is required").optional(),
    order: z.coerce.number().min(1, "Order must be at least 1").optional(),
    type: z.enum([...QUESTION_TYPES] as [typeof QUESTION_TYPES[number], ...typeof QUESTION_TYPES[number][]], { message: "Invalid question type" }).optional(),
    dataSource: z.enum(DATA_SOURCES).optional().nullable(),
    validation: z.object({
      required: z.boolean().optional(),
    }).optional(),
    next: z.array(z.object({
      condition: z.object({
        operator: z.enum(CONDITION_OPERATORS, { message: "Invalid condition operator" }),
        value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]).optional(),
      }),
      nextQuestionId: z.string().min(1, "Next question ID is required"),
    })).optional().nullable(),
    options: z.array(z.object({
      label: z.string().min(1, "Option label is required"),
      value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]).optional(),
    })).optional().nullable(),
    numberConfig: z.object({
      min: z.coerce.number().optional().nullable(),
      max: z.coerce.number().optional().nullable(),
      step: z.coerce.number().optional().nullable(),
      unit: z.string().optional().nullable(),
    }).optional().nullable(),
  })
});

export const questionIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Question ID is required"),
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
