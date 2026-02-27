import { ROLES } from "@/constants/roles";
import { AppError } from "@/utils/appError";
import { IRegistrationStrategy } from "./registration-strategy.interface";

export class UserRegistrationStrategy implements IRegistrationStrategy {
  getOtpPurpose(): string {
    return "USER_REGISTER";
  }

  validateRole(): void {
  }
}


export class TrainerRegistrationStrategy implements IRegistrationStrategy {
  getOtpPurpose(): string {
    return "TRAINER_REGISTER";
  }
  validateRole(): void {
  }
}


export class AdminRegistrationStrategy implements IRegistrationStrategy {
  getOtpPurpose(): string {
    return "ADMIN_REGISTER";
  }

  validateRole(): void {
    throw new AppError(403, "Admin register is not allowed");
  }
}


export class RegistrationStrategyFactory {
  static getStrategy(role: string): IRegistrationStrategy {
    switch (role) {
      case ROLES.USER:
        return new UserRegistrationStrategy();
      case ROLES.TRAINER:
        return new TrainerRegistrationStrategy();
      case ROLES.ADMIN:
        return new AdminRegistrationStrategy();
      default:
        throw new AppError(400, "Invalid role for registration");
    }
  }
}