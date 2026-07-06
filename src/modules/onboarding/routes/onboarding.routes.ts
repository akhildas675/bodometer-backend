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
  .get(ROLE_GUARD.ALL_GUARDS, onboardingController.getAllQuestionGroups.bind(onboardingController))
  .post(ROLE_GUARD.ADMIN_GUARD, validate(groupValidationSchema), onboardingController.createQuestionGroup.bind(onboardingController));

onboardingRoute.route(ONBOARDING_PATHS.GROUP_BY_ID)
  .get(ROLE_GUARD.ADMIN_GUARD, validate(groupIdParamSchema), onboardingController.getQuestionGroupById.bind(onboardingController))
  .put(ROLE_GUARD.ADMIN_GUARD, validate(groupUpdateSchema.merge(groupIdParamSchema)), onboardingController.updateQuestionGroup.bind(onboardingController));

onboardingRoute.route(ONBOARDING_PATHS.GROUP_TOGGLE)
  .patch(ROLE_GUARD.ADMIN_GUARD, validate(groupIdParamSchema), onboardingController.toggleQuestionGroupStatus.bind(onboardingController));

onboardingRoute.route(ONBOARDING_PATHS.QUESTIONS)
  .get(ROLE_GUARD.ALL_GUARDS, onboardingController.getQuestions.bind(onboardingController))
  .post(ROLE_GUARD.ADMIN_GUARD, validate(questionValidationSchema), onboardingController.createQuestion.bind(onboardingController));

onboardingRoute.route(ONBOARDING_PATHS.QUESTION_BY_ID)
  .get(ROLE_GUARD.ADMIN_GUARD, validate(questionIdParamSchema), onboardingController.getQuestionById.bind(onboardingController))
  .put(ROLE_GUARD.ADMIN_GUARD, validate(questionUpdateSchema.merge(questionIdParamSchema)), onboardingController.updateQuestion.bind(onboardingController));

onboardingRoute.route(ONBOARDING_PATHS.QUESTION_TOGGLE)
  .patch(ROLE_GUARD.ADMIN_GUARD, validate(questionIdParamSchema), onboardingController.toggleQuestionStatus.bind(onboardingController));

onboardingRoute.route(ONBOARDING_PATHS.QUESTIONS_DATA_SOURCES)
  .get(ROLE_GUARD.ADMIN_GUARD, onboardingController.getQuestionDataSources.bind(onboardingController));

// --- User Specific Routes ---
onboardingRoute.route(ONBOARDING_PATHS.SUBMIT)
  .post(ROLE_GUARD.USER_GUARD, validate(submitOnboardingSchema), onboardingController.submitOnboarding.bind(onboardingController));

onboardingRoute.route(ONBOARDING_PATHS.STATUS)
  .get(ROLE_GUARD.USER_GUARD, onboardingController.getOnboardingStatus.bind(onboardingController));

onboardingRoute.route(ONBOARDING_PATHS.ANSWERS)
  .get(ROLE_GUARD.USER_GUARD, onboardingController.getOnboardingAnswers.bind(onboardingController));

export default onboardingRoute;
