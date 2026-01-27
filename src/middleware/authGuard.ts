import { Request, Response, NextFunction } from "express";
import { Jwt } from "../utils/jwt.utils";
import { AppError } from "../utils/appError";
import { STATUS } from "../constants/statuscode";
import { redis } from "../config/redis";
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from "../interfaces/auth/auth.interface";
import { Role } from "../constants/identity.constants";

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

          if (allowedRoles.length && !allowedRoles.includes(payload.role)) {
            return next(new AppError(STATUS.FORBIDDEN, "Access denied"));
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
    return next(new AppError(STATUS.UNAUTHORIZED, "Authentication required"));
  }

  try {
    const payload = Jwt.verifyRefresh(refreshToken) as RefreshTokenPayload;

    const storedToken = await redis.get(`refresh:${payload.sub}`);
    if (!storedToken || storedToken !== refreshToken) {
      return next(
        new AppError(STATUS.UNAUTHORIZED, "Session expired. Login again."),
      );
    }

    if (allowedRoles.length && !allowedRoles.includes(payload.role)) {
      return next(new AppError(STATUS.FORBIDDEN, "Access denied"));
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
      new AppError(STATUS.UNAUTHORIZED, "Session expired. Login again."),
    );
  }
}
