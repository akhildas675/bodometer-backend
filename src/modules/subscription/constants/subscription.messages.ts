export const SUBSCRIPTION_MESSAGES = {
  SUBSCRIPTION_PLAN: {
    // Success
    CREATED: "Subscription plan created successfully.",
    UPDATED: "Subscription plan updated successfully.",
    DELETED: "Subscription plan deleted successfully.",
    FETCHED: "Subscription plan fetched successfully.",
    LIST_FETCHED: "Subscription plans fetched successfully.",
    ACTIVATED: "Subscription plan activated successfully.",
    DEACTIVATED: "Subscription plan deactivated successfully.",

    // Not found / conflict
    NOT_FOUND: "Subscription plan not found.",
    ALREADY_EXISTS: "A subscription plan with this name already exists.",
    PLAN_TYPE_EXISTS: "A plan of this type already exists.",
    ALREADY_ACTIVE: "Subscription plan is already active.",
    ALREADY_INACTIVE: "Subscription plan is already inactive.",
    ALREADY_SUBSCRIBED: "User already has an active subscription. Cannot purchase another at this time.",
    NO_ACTIVE_SUB_FOR_SESSION: "No active subscription found for existing session.",
    NO_ACTIVE_SUB: "No active subscription found.",

    // Failed
    CREATE_FAILED: "Failed to create subscription plan.",
    UPDATE_FAILED: "Failed to update subscription plan.",
    DELETE_FAILED: "Failed to delete subscription plan.",
    FETCH_FAILED: "Failed to fetch subscription plan.",
    ACTIVATE_FAILED: "Failed to activate subscription plan.",
    DEACTIVATE_FAILED: "Failed to deactivate subscription plan.",

    // Validation
    NAME_REQUIRED: "Plan name is required.",
    DESCRIPTION_REQUIRED: "Plan description is required.",
    PRICE_REQUIRED: "Price is required.",
    PRICE_INVALID: "Price must be a valid positive number.",
    DURATION_REQUIRED: "Duration is required.",
    DURATION_INVALID: "Duration must be at least 1 day.",
    FEATURES_REQUIRED: "At least one feature is required.",
    PLAN_TYPE_REQUIRED: "Plan type is required.",
    PLAN_TYPE_INVALID: "Invalid plan type. Must be basic, pro, or elite.",
    LIVE_SESSION_INVALID: "Live session count must be a valid number.",
    ID_REQUIRED: "Subscription plan ID is required.",

    SUBSCRIPTION_FEATURE_CREATED: "Subscription feature created successfully.",
    SUBSCRIPTION_FEATURE_CREATION_FAILED: "Failed to create subscription feature.",

    SUBSCRIPTION_FEATURE_UPDATED: "Subscription feature updated successfully.",
    SUBSCRIPTION_FEATURE_UPDATE_FAILED: "Failed to update subscription feature.",

    SUBSCRIPTION_FEATURE_DELETED: "Subscription feature deleted successfully.",
    SUBSCRIPTION_FEATURE_DELETE_FAILED: "Failed to delete subscription feature.",
    SUBSCRIPTION_FEATURE_STATUS_TOGGLED: "Subscription feature status toggled successfully.",
    SUBSCRIPTION_FEATURE_STATUS_TOGGLED_FAILED: "Subscription feature status toggled successfully.",

    SUBSCRIPTION_FEATURE_FETCHED: "Subscription feature fetched successfully.",
    SUBSCRIPTION_FEATURES_FETCHED: "Subscription features fetched successfully.",
    SUBSCRIPTION_FEATURE_FETCH_FAILED: "Failed to fetch subscription feature.",

    SUBSCRIPTION_FEATURE_NOT_FOUND: "Subscription feature not found.",
    SUBSCRIPTION_FEATURE_ALREADY_EXISTS: "Subscription feature already exists.",

    SUBSCRIPTION_FEATURE_IMAGE_REQUIRED: "Subscription feature image is required.",
    SUBSCRIPTION_FEATURE_IMAGE_UPLOAD_FAILED: "Failed to upload subscription feature image.",

    SUBSCRIPTION_PLAN_TOGGLED: "Subscription plan status toggled successfully.",
    SUBSCRIPTION_PLAN_TOGGLE_FAILED: "Failed to toggle subscription plan status.",

    SUBSCRIPTION_PLAN_FETCHED: "Subscription plan fetched successfully.",
    SUBSCRIPTION_PLANS_FETCHED: "Subscription plans fetched successfully.",
    SUBSCRIPTION_PLAN_FETCH_FAILED: "Failed to fetch subscription plan.",


    SUBSCRIPTION_PLAN_UPDATE_FAILED: "Failed to update subscription plan.",

    SUBSCRIPTION_PLAN_TOGGLE: "Subscription plan status toggled successfully.",


    SUBSCRIPTION_PLAN_NOT_FOUND: "Subscription plan not found.",
    SUBSCRIPTION_PLAN_ALREADY_EXISTS: "Subscription plan already exists.",

    SUBSCRIPTION_PLAN_IMAGE_REQUIRED: "Subscription plan image is required.",
    SUBSCRIPTION_PLAN_IMAGE_UPLOAD_FAILED: "Failed to upload subscription plan image.",

    SUBSCRIPTION_PLAN_TRANSACTIONS_FETCHED:"Subscription Transactions Fetched",
    SUBSCRIPTION_PLAN_TRANSACTIONS_FETCH_FAILED:"Subscription Transactions Fetch failed"
  },
};
