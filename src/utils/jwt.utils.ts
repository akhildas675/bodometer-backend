import jwt, { SignOptions, Secret } from "jsonwebtoken";
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from "../interfaces/auth/auth.interface";

if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error("JWT secrets are missing in environment variables");
}

const accessSecret = process.env.JWT_ACCESS_SECRET as Secret;
const refreshSecret = process.env.JWT_REFRESH_SECRET as Secret;

type JwtExpiry = `${number}${"ms" | "s" | "m" | "h" | "d"}`;

export const Jwt = {
  signAccess(payload: AccessTokenPayload) {
    const expiresIn: JwtExpiry = (process.env.ACCESS_TOKEN_EXPIRES ||
      "15m") as JwtExpiry;

    const options: SignOptions = { expiresIn };
    return jwt.sign(payload, accessSecret, options);
  },

  signRefresh(payload: RefreshTokenPayload) {
    const expiresIn: JwtExpiry = (process.env.REFRESH_TOKEN_EXPIRES ||
      "7d") as JwtExpiry;

    const options: SignOptions = { expiresIn };
    return jwt.sign(payload, refreshSecret, options);
  },

  verifyAccess(token: string): AccessTokenPayload {
    return jwt.verify(token, accessSecret) as AccessTokenPayload;
  },

  verifyRefresh(token: string): RefreshTokenPayload {
    return jwt.verify(token, refreshSecret) as RefreshTokenPayload;
  },
};
