import { Router } from "express";
import container from "@/container/container";
import { OnboardingController } from "../controller/onboarding.controller";
import { ONBOARDING_TYPES } from "../onboarding.types";
import { ROLE_GUARD } from "@/constants/role.guard";
import { validate } from "@/middleware/validate";
import { ONBOARDING_PATHS } from "@/constants/routes.constant/onboarding.paths";
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

// --- Shared / Unified Routes ---
onboardingRoute.route(ONBOARDING_PATHS.GROUPS)
  .get(ROLE_GUARD.ALL_GUARDS, onboardingController.getAllQuestionGroups)
  .post(ROLE_GUARD.ADMIN_GUARD, validate(groupValidationSchema), onboardingController.createQuestionGroup);

onboardingRoute.route(ONBOARDING_PATHS.GROUP_BY_ID)
  .get(ROLE_GUARD.ADMIN_GUARD, validate(groupIdParamSchema), onboardingController.getQuestionGroupById)
  .put(ROLE_GUARD.ADMIN_GUARD, validate(groupUpdateSchema.merge(groupIdParamSchema)), onboardingController.updateQuestionGroup);

onboardingRoute.route(ONBOARDING_PATHS.GROUP_TOGGLE)
  .patch(ROLE_GUARD.ADMIN_GUARD, validate(groupIdParamSchema), onboardingController.toggleQuestionGroupStatus);

onboardingRoute.route(ONBOARDING_PATHS.QUESTIONS)
  .get(ROLE_GUARD.ALL_GUARDS, onboardingController.getQuestions)
  .post(ROLE_GUARD.ADMIN_GUARD, validate(questionValidationSchema), onboardingController.createQuestion);

onboardingRoute.route(ONBOARDING_PATHS.QUESTION_BY_ID)
  .get(ROLE_GUARD.ADMIN_GUARD, validate(questionIdParamSchema), onboardingController.getQuestionById)
  .put(ROLE_GUARD.ADMIN_GUARD, validate(questionUpdateSchema.merge(questionIdParamSchema)), onboardingController.updateQuestion);

onboardingRoute.route(ONBOARDING_PATHS.QUESTION_TOGGLE)
  .patch(ROLE_GUARD.ADMIN_GUARD, validate(questionIdParamSchema), onboardingController.toggleQuestionStatus);

onboardingRoute.route(ONBOARDING_PATHS.QUESTIONS_DATA_SOURCES)
  .get(ROLE_GUARD.ADMIN_GUARD, onboardingController.getQuestionDataSources);

// --- User Specific Routes ---
onboardingRoute.route(ONBOARDING_PATHS.SUBMIT)
  .post(ROLE_GUARD.USER_GUARD, validate(submitOnboardingSchema), onboardingController.submitOnboarding);

onboardingRoute.route(ONBOARDING_PATHS.STATUS)
  .get(ROLE_GUARD.USER_GUARD, onboardingController.getOnboardingStatus);

onboardingRoute.route(ONBOARDING_PATHS.ANSWERS)
  .get(ROLE_GUARD.USER_GUARD, onboardingController.getOnboardingAnswers);

export default onboardingRoute;
