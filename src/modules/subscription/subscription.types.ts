
export const SUBSCRIPTION_TYPES={
    SubscriptionFeatureRepository:Symbol.for("SubscriptionFeatureRepository"),
    SubscriptionPlanRepository:Symbol.for("SubscriptionPlanRepository"),
    SubscriptionTransactionRepository:Symbol.for("SubscriptionTransactionRepository"),
    UserSubscriptionRepository:Symbol.for("UserSubscriptionRepository"),

    AnswerRepository:Symbol.for("AnswerRepository"),


    //services

    PaymentService:Symbol.for("PaymentService"),
    WorkoutPlanService:Symbol.for("WorkoutPlanService"),
    Service:Symbol.for("SubscriptionService"),

    

        //controller

    SubscriptionController:Symbol.for("SubscriptionController")
}