import { injectable } from "inversify";
import { SessionData } from "../../modules/auth/interface/auth.interface";
import { ISessionService } from "../../modules/auth/interface/session-service.interface";
import { Jwt } from "../../utils/jwt.utils";
import { OtpModel } from "../../modules/otp/model/otp.model";

@injectable()
export class SessionService implements ISessionService {
  async createRefreshToken(
    userId: string,
    userData: SessionData,
  ): Promise<string> {
    return Jwt.signRefresh({
      sub: userId,
      role: userData.role,
    });
  }

  async findUserByRefreshToken(refreshToken: string): Promise<string | null> {
    try {
      const payload = Jwt.verifyRefresh(refreshToken);
      return payload.sub;
    } catch {
      return null;
    }
  }

  async validateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<boolean> {
    try {
      const payload = Jwt.verifyRefresh(refreshToken);
      return payload.sub === userId;
    } catch {
      return false;
    }
  }

  async getUserSessionData(_userId: string): Promise<SessionData | null> {
    return null;
  }

  async deleteSession(_refreshToken: string): Promise<void> {
    // Stateless JWT tokens do not require server-side deletion
  }

  async markOtpAsVerified(purpose: string, email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    await OtpModel.updateOne(
      { email: normalizedEmail, purpose },
      { isVerified: true },
    );
  }

  async isOtpVerified(purpose: string, email: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();
    const otpRecord = await OtpModel.findOne({ email: normalizedEmail, purpose });
    return Boolean(otpRecord?.isVerified);
  }

  async clearOtpVerification(purpose: string, email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    await OtpModel.deleteMany({ email: normalizedEmail, purpose });
  }
}
