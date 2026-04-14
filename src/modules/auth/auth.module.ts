import { AuthController } from "@/controllers/auth/auth.controller";
import { IAuthRepository } from "@/interfaces/auth/auth-repository.interface";
import { IAuthService } from "@/interfaces/auth/auth-service.interface";
import { ISessionService } from "@/interfaces/auth/session-service.interface";
import { IMailService } from "@/interfaces/otp/mail-service.interface";
import { IOtpService } from "@/interfaces/otp/otp-service.interface";
import { ISubscriptionTransactionRepository } from "@/interfaces/subscription/subscription.transaction-repository.interface";
import { ITrainerProfileRepository } from "@/interfaces/trainer/trainer.profile-repository.interface";
import SubscriptionTransactionRepository from "@/repositories/subscription-transaction.repository";
import TrainerProfileRepository from "@/repositories/trainer-profile.repository";
import UserRepository from "@/repositories/user.repository";
import { AuthService } from "@/services/auth/auth.services";
import { MailService } from "@/services/auth/otp/mail.services";
import { OtpService } from "@/services/auth/otp/otp.services";
import { SessionService } from "@/services/auth/session/session.services";

export function createAuthModule(){
    const mailService:IMailService = new MailService()
    const otpService:IOtpService = new OtpService(mailService);
    const sessionService:ISessionService = new SessionService();

    const userRepository = new UserRepository()
    const trainerProfileRepository : ITrainerProfileRepository = new TrainerProfileRepository();
    const subscriptionTransactionRepository:ISubscriptionTransactionRepository = new SubscriptionTransactionRepository()

    const authService:IAuthService = new AuthService(
        userRepository,
        otpService,
        sessionService,
        trainerProfileRepository,
        subscriptionTransactionRepository,

    );

    const authController = new AuthController(authService)

    return {authController}
}