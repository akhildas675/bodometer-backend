import { Router } from "express";
import { SubscriptionController } from "../controller/subscription.controller";
import { SUBSCRIPTION_TYPES } from "../subscription.types";
import container from "@/container/container";
import { validate } from "@/middleware/validate";
import { featureIdParamSchema, featureUpdateSchema, featureValidationSchema, subscriptionPlanIdParamSchema, subscriptionPlanUpdateSchema, subscriptionPlanValidationSchema, checkoutSessionSchema, verifyPaymentSchema } from "../validation/subscription.validation";
import { ROLE_GUARD } from "@/constants/constant.values.ts/role.guard";
import { SUBSCRIPTION_FEATURE_PATHS, SUBSCRIPTION_PLAN_PATHS } from "../constants/subscription.paths";

const subscriptionRoute = Router();

const subscriptionController = container.get<SubscriptionController>(SUBSCRIPTION_TYPES.SubscriptionController);


subscriptionRoute.post(
  SUBSCRIPTION_FEATURE_PATHS.ROOT,
  validate(featureValidationSchema),
  ROLE_GUARD.ADMIN_GUARD,
  subscriptionController.createSubscriptionFeature,
);
subscriptionRoute.get(
  SUBSCRIPTION_FEATURE_PATHS.ROOT,
  ROLE_GUARD.ADMIN_GUARD,
  subscriptionController.getAllSubscriptionFeatures,
);
subscriptionRoute.put(
  SUBSCRIPTION_FEATURE_PATHS.BY_ID,
  validate(featureUpdateSchema.merge(featureIdParamSchema)),
  ROLE_GUARD.ADMIN_GUARD,
  subscriptionController.updateSubscriptionFeature,
);
subscriptionRoute.patch(
  SUBSCRIPTION_FEATURE_PATHS.TOGGLE_STATUS,
  validate(featureIdParamSchema),
  ROLE_GUARD.ADMIN_GUARD,
  subscriptionController.toggleSubscriptionFeatureStatus,
);
subscriptionRoute.get(
 SUBSCRIPTION_FEATURE_PATHS.BY_ID,
  ROLE_GUARD.ADMIN_GUARD,
  subscriptionController.getSubscriptionFeatureById,
);

//Plan Route
subscriptionRoute.post(
  SUBSCRIPTION_PLAN_PATHS.ROOT,
  validate(subscriptionPlanValidationSchema),
  ROLE_GUARD.ADMIN_GUARD,
  subscriptionController.createSubscriptionPlan,
);

subscriptionRoute.patch(
  SUBSCRIPTION_PLAN_PATHS.TOGGLE_STATUS,
  validate(subscriptionPlanIdParamSchema),
  ROLE_GUARD.ADMIN_GUARD,
  subscriptionController.toggleSubscriptionPlanStatus,
);

subscriptionRoute.put(
  SUBSCRIPTION_PLAN_PATHS.BY_ID,
  validate(subscriptionPlanUpdateSchema.merge(subscriptionPlanIdParamSchema)),
  ROLE_GUARD.ADMIN_GUARD,
  subscriptionController.updateSubscriptionPlan,
);


subscriptionRoute.get(
  SUBSCRIPTION_PLAN_PATHS.ROOT,
  ROLE_GUARD.ALL_GUARDS,
  subscriptionController.getSubscriptionPlans,
);

subscriptionRoute.get(
  SUBSCRIPTION_PLAN_PATHS.BY_ID,
  validate(subscriptionPlanIdParamSchema),
  ROLE_GUARD.ADMIN_GUARD,
  subscriptionController.getSubscriptionPlanById,
);

subscriptionRoute.get(
  SUBSCRIPTION_PLAN_PATHS.TRANSACTIONS,
  ROLE_GUARD.ALL_GUARDS,
  subscriptionController.getAllSubscriptionTransactions,
);

subscriptionRoute.post(
  SUBSCRIPTION_PLAN_PATHS.CHECKOUT_SESSION, validate(checkoutSessionSchema),
  ROLE_GUARD.USER_GUARD,
  subscriptionController.createCheckoutSession,
);

subscriptionRoute.get(
 SUBSCRIPTION_PLAN_PATHS.VERIFY_PAYMENT, validate(verifyPaymentSchema),
  ROLE_GUARD.USER_GUARD,
  subscriptionController.verifyPayment,
);

subscriptionRoute.get(
  SUBSCRIPTION_PLAN_PATHS.ACTIVE,
  ROLE_GUARD.USER_GUARD,
  subscriptionController.getActiveSubscription,
);

subscriptionRoute.get(
  SUBSCRIPTION_PLAN_PATHS.USER_TRANSACTIONS,
  ROLE_GUARD.USER_GUARD,
  subscriptionController.getUserTransactions,
);

export default subscriptionRoute