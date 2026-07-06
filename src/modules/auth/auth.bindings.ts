import { Container } from "inversify";
import { AUTH_TYPES } from "./auth.types";import { IAuthService } from "./interface/auth-service.interface";
import { AuthService } from "./service/auth.services";
import { IOtpService } from '@/modules/otp/interface/otp-service.interface';
import { OtpService } from "@/services/otp/otp.services";
import { ISessionService } from "./interface/session-service.interface";
import { SessionService } from "@/services/session/session.services";
import { AuthController } from "./controller/auth.controller";
import { IMailService } from '@/modules/otp/interface/mail-service.interface';
import { MailService } from "@/services/mail.service/mail.services";

export const loadAuthBindings=(
    container:Container
)=>{
  

    container.bind<IAuthService>(AUTH_TYPES.AuthService)
    .to(AuthService);

    container.bind<IOtpService>(AUTH_TYPES.OTPService)
    .to(OtpService);

    container.bind<IMailService>(AUTH_TYPES.MailService)
    .to(MailService)

    container.bind<ISessionService>(AUTH_TYPES.SessionService)
    .to(SessionService)

    container.bind(AUTH_TYPES.AuthController)
    .to(AuthController)
}