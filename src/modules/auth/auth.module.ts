import { AuthController } from "../../controllers/auth/auth.controller";
import { ITrainerProfileRepository } from "../../interfaces/repository-interface/trainer/trainer.profile-repository.interface";
import { IAuthService } from "../../interfaces/service-interface/auth/auth-service.interface";
import { ISessionService } from "../../interfaces/service-interface/auth/session-service.interface";
import { IMailService } from "../../interfaces/service-interface/otp/mail-service.interface";
import { IOtpService } from "../../interfaces/service-interface/otp/otp-service.interface";
import TrainerProfileRepository from "../../repositories/trainer-profile.repository";
import UserRepository from "../../repositories/user.repository";
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
   

    const authService:IAuthService = new AuthService(
        userRepository,
        otpService,
        sessionService,
        trainerProfileRepository,
    

    );

    const authController = new AuthController(authService)

    return {authController}
}