import { AuthController } from "../../controllers/auth/auth.controller";
import { IAuthRepository } from "../../interfaces/auth/auth-repository.interface";
import { IAuthService } from "../../interfaces/auth/auth-service.interface";
import { ISessionService } from "../../interfaces/auth/session-service.interface";
import { IMailService } from "../../interfaces/otp/mail-service.interface";
import { IOtpService } from "../../interfaces/otp/otp-service.interface";
import { ITrainerProfileRepository } from "../../interfaces/trainer/trainer.profile-repository.interface";
import AuthRepository from "../../repositories/auth/auth.repository";
import TrainerProfileRepository from "../../repositories/trainer/trainer-profile.repository";
import { AuthService } from "../../services/auth/auth.services";
import { MailService } from "../../services/auth/otp/mail.services";
import { OtpService } from "../../services/auth/otp/otp.services";
import { SessionService } from "../../services/auth/session/session.services";

export function createAuthModule(){
    const mailService:IMailService = new MailService()
    const otpService:IOtpService = new OtpService(mailService);
    const sessionService:ISessionService = new SessionService();

    const authRepository:IAuthRepository = new AuthRepository();
    const trainerProfileRepository : ITrainerProfileRepository = new TrainerProfileRepository();

    const authService:IAuthService = new AuthService(
        authRepository,
        otpService,
        sessionService,
        trainerProfileRepository
    );

    const authController = new AuthController(authService)

    return {authController}
}