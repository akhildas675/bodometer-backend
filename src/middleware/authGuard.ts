import { Request, Response, NextFunction } from "express";
import { Role } from "../constants/roles";
import { UserModel } from "../models/user.model";
import { AppError } from "../utils/appError";
import { STATUS } from "../constants/statuscode";
import { MESSAGES } from "../constants/messages";
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from "../interfaces/service-interface/auth/auth.interface";
import { redis } from "../config/redis";
import { Jwt } from "../utils/jwt.utils";

export interface AuthRequest extends Request {
  file?: Express.Multer.File | undefined;
  user?: {
    id: string;
    role: Role;
  };
}

export const authGuard = (allowedRoles: Role[] = []) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const accessToken = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

      if (accessToken) {
        try {
          const payload = Jwt.verifyAccess(accessToken) as AccessTokenPayload;

          const user = await UserModel.findById(payload.sub).select(
            "isBlocked role",
          );

          if (!user) {
            return next(new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND));
          }

          if (user.isBlocked) {
            await redis.del(`refresh:${payload.sub}`);

            res.clearCookie("refreshToken");

            return next(
              new AppError(STATUS.FORBIDDEN, MESSAGES.LOGIN.ACCOUNT_BLOCKED),
            );
          }

          if (allowedRoles.length && !allowedRoles.includes(payload.role)) {
            return next(new AppError(STATUS.FORBIDDEN, MESSAGES.COMMON.ACCESS_DENIED));
          }

          req.user = { id: payload.sub, role: payload.role };
          return next();
        } catch {}
      }

      return await handleRefresh(req, res, next, allowedRoles);
    } catch (error) {
      return next(error);
    }
  };
};

async function handleRefresh(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
  allowedRoles: Role[],
) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return next(new AppError(STATUS.UNAUTHORIZED, MESSAGES.TOKEN.AUTHENTICATION_REQUIRED));
  }

  try {
    const payload = Jwt.verifyRefresh(refreshToken) as RefreshTokenPayload;

    const storedToken = await redis.get(`refresh:${payload.sub}`);
    if (!storedToken || storedToken !== refreshToken) {
      return next(
        new AppError(STATUS.UNAUTHORIZED, MESSAGES.TOKEN.REFRESH_TOKEN_EXPIRED),
      );
    }

    if (allowedRoles.length && !allowedRoles.includes(payload.role)) {
      return next(new AppError(STATUS.FORBIDDEN, MESSAGES.COMMON.ACCESS_DENIED));
    }

    const newAccessToken = Jwt.signAccess({
      sub: payload.sub,
      role: payload.role,
    });

    res.setHeader("x-access-token", newAccessToken);

    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return next(
      new AppError(STATUS.UNAUTHORIZED, MESSAGES.TOKEN.REFRESH_TOKEN_EXPIRED),
    );
  }
}
