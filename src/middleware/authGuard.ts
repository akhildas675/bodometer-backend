import { Request,Response,NextFunction } from "express";
import { Jwt } from "../utils/jwt.utils";
import { AppError } from "../utils/appError";
import { AccessTokenPayload, RefreshTokenPayload } from "../interfaces/userInterfaces/userInterface";
import { STATUS } from "../constants/statuscode";

export interface AuthRequest extends Request{
    user?:{
        id:string;
        role:"user" | "trainer" | "admin";
    };
}


export const authGuard = (allowedRoles: ("user" | "trainer" | "admin")[] = []) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const accessToken = authHeader?.startsWith("Bearer")
        ? authHeader.split(" ")[1]
        : null;

      if (!accessToken) {
        return tryRefresh(req, res, next, allowedRoles);
      }

      try {
        const payload: AccessTokenPayload = Jwt.verifyAccess(accessToken);

        req.user = { id: payload.sub, role: payload.role };

        if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
          throw new AppError(STATUS.UNAUTHORIZED, "Access denied");
        }

        return next();
      } catch (err) {
        return tryRefresh(req, res, next, allowedRoles);
      }
    } catch (err) {
      next(err);
    }
  };
};
function tryRefresh(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
  allowedRoles: ("user" | "trainer" | "admin")[]
) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError(STATUS.UNAUTHORIZED, "Authentication required");
  }

  try {
    const payload: RefreshTokenPayload = Jwt.verifyRefresh(refreshToken);

    const newAccessToken = Jwt.signAccess({
      sub: payload.sub,
      role: payload.role,
    });

   
    req.user = { id: payload.sub, role: payload.role };

    if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
      throw new AppError(STATUS.UNAUTHORIZED, "Access denied");
    }

    return next();
  } catch (err) {
    throw new AppError(STATUS.UNAUTHORIZED, "Session expired. Login again.");
  }
}
