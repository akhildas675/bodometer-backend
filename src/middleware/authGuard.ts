import { Request, Response, NextFunction, RequestHandler } from "express";
import { Role } from "../constants/constant.values.ts/roles";
import { UserModel } from "@/modules/auth/model/user.model";
import { AppError } from "../utils/appError";
import { STATUS } from "../constants/constant.values.ts/statuscode";
import { MESSAGES } from "../constants/messages";
import { Jwt } from "../utils/jwt.utils";

export interface AuthRequest extends Request {
  file?: Express.Multer.File | undefined;
  user?: {
    id: string;
    role: Role;
  };
}

function createAuthMiddleware(allowedRoles: readonly Role[] = []): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const authHeader = authReq.headers?.authorization;
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
            res.clearCookie("refreshToken", {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "none",
              domain: process.env.COOKIE_DOMAIN || ".bodometer.online",
              path: "/",
            });

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
          // Access token invalid/expired - return 401 to let frontend handle refresh
          return next(new AppError(STATUS.UNAUTHORIZED, MESSAGES.TOKEN.AUTHENTICATION_REQUIRED));
        }
      }

      // No access token provided - return 401
      return next(new AppError(STATUS.UNAUTHORIZED, MESSAGES.TOKEN.AUTHENTICATION_REQUIRED));
    } catch (error: unknown) {
      if (error instanceof Error) {
        return next(error);
      } else {
        return next(new Error("Unknown error occurred"));
      }
    }
  };
}

export function authGuard(
  allowedRoles?: readonly Role[],
): RequestHandler;
export function authGuard(
  req: Request,
  res: Response,
  next: NextFunction,
): void | Promise<void>;
export function authGuard(
  allowedRolesOrReq?: readonly Role[] | Request,
  res?: Response,
  next?: NextFunction,
): RequestHandler | void | Promise<void> {
  if (
    allowedRolesOrReq &&
    typeof allowedRolesOrReq === "object" &&
    !Array.isArray(allowedRolesOrReq) &&
    "headers" in allowedRolesOrReq &&
    res &&
    next
  ) {
    void createAuthMiddleware([])(allowedRolesOrReq, res, next);
    return;
  }
  return createAuthMiddleware(
    Array.isArray(allowedRolesOrReq) ? allowedRolesOrReq : [],
  );
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
        }
      } catch {
        // Invalid token - ignore
      }
    }

    next();
  } catch {
    next();
  }
};
