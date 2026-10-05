import { Container } from "inversify";
import { AUTH_TYPES } from "./auth.types";import { IAuthService } from "./interface/auth-service.interface";
import { AuthService } from "./service/auth.services";
import { IOtpService } from '@/modules/otp/interface/otp-service.interface';
import { OtpService } from "@/modules/otp/service/otp.services";
import { ISessionService } from "./interface/session-service.interface";
import { SessionService } from "@/services/session/session.services";
import { AuthController } from "./controller/auth.controller";
import { IMailService } from '@/modules/otp/interface/mail-service.interface';
import { MailService } from "@/services/mail.service/mail.services";
import { IOtpRepository } from "../otp/interface/otp-repository.interface";
import { OtpRepository } from "../otp/repository/otp.repository";

export const loadAuthBindings=(
    container:Container
)=>{

  container.bind<IOtpRepository>(AUTH_TYPES.OtpRepository)
  .to(OtpRepository)
  

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