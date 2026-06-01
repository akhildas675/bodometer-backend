import { AuthController } from "../../controllers/auth/auth.controller";
import { ITrainerProfileRepository } from "../../interfaces/repository-interface/trainer/trainer.profile-repository.interface";
import { IAuthService } from "../../interfaces/service-interface/auth/auth-service.interface";
import { ISessionService } from "../../interfaces/service-interface/auth/session-service.interface";
import { IMailService } from "../../interfaces/service-interface/otp/mail-service.interface";
import { IOtpService } from "../../interfaces/service-interface/otp/otp-service.interface";
import { IUserSubscriptionRepository } from "../../interfaces/repository-interface/subscription/user.subscription.repository.interface";
import { IAnswerRepository } from "../../interfaces/repository-interface/onboarding/answer-repository.interface";
import TrainerProfileRepository from "@/repositories/trainer/trainer-profile.repository";
import UserRepository from "@/repositories/user/user.repository";
import { UserSubscriptionRepository } from "@/repositories/subscription/user-subscription.repository";
import AnswerRepository from "@/repositories/onboarding/answer.repository";
import { AuthService } from "../../services/auth/auth.services";
import { MailService } from "../../services/auth/otp/mail.services";
import { OtpService } from "../../services/auth/otp/otp.services";
import { SessionService } from "../../services/auth/session/session.services";

export function createAuthModule(){
    const mailService:IMailService = new MailService()
    const otpService:IOtpService = new OtpService(mailService);
    const sessionService:ISessionService = new SessionService();

    const userRepository = new UserRepository()
    const trainerProfileRepository : ITrainerProfileRepository = new TrainerProfileRepository();
    const userSubscriptionRepository: IUserSubscriptionRepository = new UserSubscriptionRepository();
    const answerRepository: IAnswerRepository = new AnswerRepository();

    const authService:IAuthService = new AuthService(
        userRepository,
        otpService,
        sessionService,
        trainerProfileRepository,
        userSubscriptionRepository,
        answerRepository
    );

    const authController = new AuthController(authService)

    return {authController}
}