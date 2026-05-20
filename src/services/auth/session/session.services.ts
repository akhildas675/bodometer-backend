import { redis } from "../../../config/redis";
import { SessionData } from "../../../interfaces/service-interface/auth/auth.interface";


export class SessionService {
  private readonly REFRESH_TOKEN_TTL = 60 * 60 * 24 * 7;
  private readonly OTP_VERIFIED_TTL = 60 * 10;

  // Refresh Token Operations
  async createRefreshToken(
    userId: string,
    userData: SessionData,
  ): Promise<string> {
    const refreshToken = crypto.randomUUID();

    await redis.set(
      `refresh:${userId}`,
      refreshToken,
      "EX",
      this.REFRESH_TOKEN_TTL,
    );

    await redis.set(
      `user:${userId}`,
      JSON.stringify(userData),
      "EX",
      this.REFRESH_TOKEN_TTL,
    );

    return refreshToken;
  }

  async findUserByRefreshToken(refreshToken: string): Promise<string | null> {
    const keys = await redis.keys("refresh:*");

    for (const key of keys) {
      const storedToken = await redis.get(key);
      if (storedToken === refreshToken) {
        return key.replace("refresh:", "");
      }
    }

    return null;
  }

  async validateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<boolean> {
    const storedToken = await redis.get(`refresh:${userId}`);
    return storedToken === refreshToken;
  }

  async getUserSessionData(userId: string): Promise<SessionData | null> {
    const userData = await redis.get(`user:${userId}`);
    return userData ? (JSON.parse(userData) as SessionData) : null;
  }

  async deleteSession(refreshToken: string): Promise<void> {
    const keys = await redis.keys("refresh:*");

    for (const key of keys) {
      const storedToken = await redis.get(key);
      if (storedToken === refreshToken) {
        const userId = key.replace("refresh:", "");
        await redis.del(key);
        await redis.del(`user:${userId}`);
        break;
      }
    }
  }

  // OTP Verification Tracking
  async markOtpAsVerified(purpose: string, email: string): Promise<void> {
    const redisKey = `otp_verified:${purpose}:${email}`;
    await redis.set(redisKey, "true", "EX", this.OTP_VERIFIED_TTL);
  }

  async isOtpVerified(purpose: string, email: string): Promise<boolean> {
    const redisKey = `otp_verified:${purpose}:${email}`;
    const verified = await redis.get(redisKey);
    return verified === "true";
  }

  async clearOtpVerification(purpose: string, email: string): Promise<void> {
    const redisKey = `otp_verified:${purpose}:${email}`;
    await redis.del(redisKey);
  }
}
