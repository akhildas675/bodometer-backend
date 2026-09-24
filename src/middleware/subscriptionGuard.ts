import { Request, Response, NextFunction, RequestHandler } from "express";
import { AuthRequest } from "./authGuard";
import { ROLES } from "../constants/constant.values.ts/roles";
import { STATUS } from "../constants/constant.values.ts/statuscode";
import { MESSAGES } from "../constants/messages";
import { AppError } from "../utils/appError";
import container from "@/container/container";
import { SUBSCRIPTION_TYPES } from "@/modules/subscription/subscription.types";
import { ISubscriptionService } from "@/modules/subscription/interface/subscription-interface.service";

export const requireActiveSubscription: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const user = authReq.user;
    if (!user) {
      return next(
        new AppError(STATUS.UNAUTHORIZED, MESSAGES.COMMON.UNAUTHORIZED),
      );
    }

    if (user.role === ROLES.USER) {
      const subscriptionService = container.get<ISubscriptionService>(
        SUBSCRIPTION_TYPES.Service,
      );
      const activeSub = await subscriptionService.getActiveSubscription(user.id);
      if (!activeSub) {
        return next(
          new AppError(
            STATUS.FORBIDDEN,
            MESSAGES.CHAT.SUBSCRIPTION_REQUIRED,
          ),
        );
      }
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
