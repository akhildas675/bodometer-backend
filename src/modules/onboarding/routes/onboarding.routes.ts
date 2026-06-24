import container from "@/container/container";
import { Router } from "express";
import { OnboardingController } from "../controller/onboarding.controller";
import { ONBOARDING_TYPES } from "../onboarding.types";
import { ROLE_GUARD } from "@/constants/role.guard";
import { validate } from "@/middleware/validate";
import {
  groupValidationSchema,
  groupUpdateSchema,
  groupIdParamSchema,
  questionValidationSchema,
  questionUpdateSchema,
  questionIdParamSchema,
  submitOnboardingSchema,
} from "../validation/onboarding.validation";

const onboardingRoute = Router();
const onboardingController = container.get<OnboardingController>(
  ONBOARDING_TYPES.Controller,
);

// --- User Routes ---
onboardingRoute.get(
  "/groups",
  ROLE_GUARD.ALL_GUARDS,
  onboardingController.getOnboardingGroups,
);

onboardingRoute.get(
  "/questions",
  ROLE_GUARD.ALL_GUARDS,
  onboardingController.getQuestions,
);

onboardingRoute.post(
  "/submit",
  ROLE_GUARD.USER_GUARD,
  validate(submitOnboardingSchema),
  onboardingController.submitOnboarding,
);

onboardingRoute.get(
  "/status",
  ROLE_GUARD.USER_GUARD,
  onboardingController.getOnboardingStatus,
);

onboardingRoute.get(
  "/answers",
  ROLE_GUARD.USER_GUARD,
  onboardingController.getOnboardingAnswers,
);

// --- Admin Routes ---
onboardingRoute.post(
  "/admin/groups",
  ROLE_GUARD.ADMIN_GUARD,
  validate(groupValidationSchema),
  onboardingController.createQuestionGroup,
);

onboardingRoute.get(
  "/admin/groups",
  ROLE_GUARD.ADMIN_GUARD,
  onboardingController.getAllQuestionGroups,
);

onboardingRoute.get(
  "/admin/groups/:id",
  ROLE_GUARD.ADMIN_GUARD,
  validate(groupIdParamSchema),
  onboardingController.getQuestionGroupById,
);

onboardingRoute.put(
  "/admin/groups/:id",
  ROLE_GUARD.ADMIN_GUARD,
  validate(groupUpdateSchema.merge(groupIdParamSchema)),
  onboardingController.updateQuestionGroup,
);

onboardingRoute.patch(
  "/admin/groups/:id/toggle",
  ROLE_GUARD.ADMIN_GUARD,
  validate(groupIdParamSchema),
  onboardingController.toggleQuestionGroupStatus,
);

onboardingRoute.post(
  "/admin/questions",
  ROLE_GUARD.ADMIN_GUARD,
  validate(questionValidationSchema),
  onboardingController.createQuestion,
);

onboardingRoute.get(
  "/admin/questions",
  ROLE_GUARD.ADMIN_GUARD,
  onboardingController.getQuestions,
);

onboardingRoute.get(
  "/admin/questions/:id",
  ROLE_GUARD.ADMIN_GUARD,
  validate(questionIdParamSchema),
  onboardingController.getQuestionById,
);

onboardingRoute.put(
  "/admin/questions/:id",
  ROLE_GUARD.ADMIN_GUARD,
  validate(questionUpdateSchema.merge(questionIdParamSchema)),
  onboardingController.updateQuestion,
);

onboardingRoute.patch(
  "/admin/questions/:id/toggle",
  ROLE_GUARD.ADMIN_GUARD,
  validate(questionIdParamSchema),
  onboardingController.toggleQuestionStatus,
);

onboardingRoute.get(
  "/admin/questions/data-sources",
  ROLE_GUARD.ADMIN_GUARD,
  onboardingController.getQuestionDataSources,
);

export default onboardingRoute;
