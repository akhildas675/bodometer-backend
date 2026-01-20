import { SessionData } from "./auth.interface";

export interface SessionServiceInterface {

  createRefreshToken(userId: string, userData: SessionData): Promise<string>;
  
  findUserByRefreshToken(refreshToken: string): Promise<string | null>;
  
  validateRefreshToken(userId: string, refreshToken: string): Promise<boolean>;
  
  getUserSessionData(userId: string): Promise<SessionData | null>;
  
  deleteSession(refreshToken: string): Promise<void>;
  
  markOtpAsVerified(purpose: string, email: string): Promise<void>;
  
  isOtpVerified(purpose: string, email: string): Promise<boolean>;
  
  clearOtpVerification(purpose: string, email: string): Promise<void>;
}