export const AUTH_TYPES={
    UserSubscriptionRepository:Symbol.for("UserSubscriptionRepository"),
    AnswerRepository:Symbol.for("AnswerRepository"),
    OtpRepository:Symbol.for("OtpRepository"),

    //Service
    AuthService:Symbol.for("AuthService"),
    OTPService:Symbol.for("OtpService"),
    MailService:Symbol.for("MailService"),
    SessionService:Symbol.for("SessionService"),


    AuthController:Symbol.for("AuthController")
}