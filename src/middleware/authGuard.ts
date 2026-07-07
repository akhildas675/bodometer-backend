import { Request, Response, NextFunction } from "express";
import { Role } from "../constants/roles";
import { UserModel } from "@/modules/auth/model/user.model";
import { AppError } from "../utils/appError";
import { STATUS } from "../constants/statuscode";
import { MESSAGES } from "../constants/messages";
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
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const authHeader = authReq.headers.authorization;
      const accessToken = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

      if (accessToken) {
        try {
          const payload = Jwt.verifyAccess(accessToken);

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

          authReq.user = { id: payload.sub, role: payload.role };
          return next();
        } catch {
          // Access token invalid/expired, fall through to refresh token validation
        }
      }

      return await handleRefresh(authReq, res, next, allowedRoles);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return next(error);
      } else {
        return next(new Error("Unknown error occurred"));
      }
    }
  };
};

async function handleRefresh(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
  allowedRoles: Role[],
) {
  const cookies = req.cookies as Record<string, string | undefined> | undefined;
  const refreshToken = cookies?.refreshToken;

  if (!refreshToken) {
    return next(new AppError(STATUS.UNAUTHORIZED, MESSAGES.TOKEN.AUTHENTICATION_REQUIRED));
  }

  try {
    const payload = Jwt.verifyRefresh(refreshToken);

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

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const authHeader = authReq.headers.authorization;
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (accessToken) {
      try {
        const payload = Jwt.verifyAccess(accessToken);
        const user = await UserModel.findById(payload.sub).select("isBlocked role");
        if (user && !user.isBlocked) {
          authReq.user = { id: payload.sub, role: payload.role };
          next();
          return;
        }
      } catch {
        // Fall through to cookies validation if verification fails
      }
    }

    const cookies = authReq.cookies as Record<string, string | undefined> | undefined;
    const refreshToken = cookies?.refreshToken;

    if (refreshToken) {
      try {
        const payload = Jwt.verifyRefresh(refreshToken);
        const storedToken = await redis.get(`refresh:${payload.sub}`);
        if (storedToken && storedToken === refreshToken) {
          const newAccessToken = Jwt.signAccess({
            sub: payload.sub,
            role: payload.role,
          });
          res.setHeader("x-access-token", newAccessToken);
          authReq.user = { id: payload.sub, role: payload.role };
        }
      } catch {
        // Ignore invalid refresh token
      }
    }

    next();
  } catch {
    next();
  }
};
