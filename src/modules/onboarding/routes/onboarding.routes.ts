import { Router } from "express";
import container from "@/container/container";
import { OnboardingController } from "../controller/onboarding.controller";
import { ONBOARDING_TYPES } from "../onboarding.types";
import { ROLE_GUARD } from "@/constants/constant.values.ts/role.guard";
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


onboardingRoute.get(
  ONBOARDING_PATHS.GROUPS,
  ROLE_GUARD.ALL_GUARDS,
  onboardingController.getAllQuestionGroups,
);
onboardingRoute.post(
  ONBOARDING_PATHS.GROUPS,
  ROLE_GUARD.ADMIN_GUARD,
  validate(groupValidationSchema),
  onboardingController.createQuestionGroup,
);

onboardingRoute.get(
  ONBOARDING_PATHS.GROUP_BY_ID,
  ROLE_GUARD.ADMIN_GUARD,
  validate(groupIdParamSchema),
  onboardingController.getQuestionGroupById,
);
onboardingRoute.put(
  ONBOARDING_PATHS.GROUP_BY_ID,
  ROLE_GUARD.ADMIN_GUARD,
  validate(groupUpdateSchema.merge(groupIdParamSchema)),
  onboardingController.updateQuestionGroup,
);

onboardingRoute.patch(
  ONBOARDING_PATHS.GROUP_TOGGLE,
  ROLE_GUARD.ADMIN_GUARD,
  validate(groupIdParamSchema),
  onboardingController.toggleQuestionGroupStatus,
);

onboardingRoute.get(
  ONBOARDING_PATHS.QUESTIONS,
  ROLE_GUARD.ALL_GUARDS,
  onboardingController.getQuestions,
);
onboardingRoute.post(
  ONBOARDING_PATHS.QUESTIONS,
  ROLE_GUARD.ADMIN_GUARD,
  validate(questionValidationSchema),
  onboardingController.createQuestion,
);

onboardingRoute.get(
  ONBOARDING_PATHS.QUESTION_BY_ID,
  ROLE_GUARD.ADMIN_GUARD,
  validate(questionIdParamSchema),
  onboardingController.getQuestionById,
);
onboardingRoute.put(
  ONBOARDING_PATHS.QUESTION_BY_ID,
  ROLE_GUARD.ADMIN_GUARD,
  validate(questionUpdateSchema.merge(questionIdParamSchema)),
  onboardingController.updateQuestion,
);

onboardingRoute.patch(
  ONBOARDING_PATHS.QUESTION_TOGGLE,
  ROLE_GUARD.ADMIN_GUARD,
  validate(questionIdParamSchema),
  onboardingController.toggleQuestionStatus,
);

onboardingRoute.get(
  ONBOARDING_PATHS.QUESTIONS_DATA_SOURCES,
  ROLE_GUARD.ADMIN_GUARD,
  onboardingController.getQuestionDataSources,
);


onboardingRoute.post(
  ONBOARDING_PATHS.SUBMIT,
  ROLE_GUARD.USER_GUARD,
  validate(submitOnboardingSchema),
  onboardingController.submitOnboarding,
);

onboardingRoute.get(
  ONBOARDING_PATHS.STATUS,
  ROLE_GUARD.USER_GUARD,
  onboardingController.getOnboardingStatus,
);

onboardingRoute.get(
  ONBOARDING_PATHS.ANSWERS,
  ROLE_GUARD.USER_GUARD,
  onboardingController.getOnboardingAnswers,
);

export default onboardingRoute;
