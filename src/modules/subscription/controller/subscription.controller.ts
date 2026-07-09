import { inject, injectable } from "inversify";
import { ISubscriptionService } from "../interface/subscription-interface.service";
import { AuthRequest } from "@/middleware/authGuard";
import { Request, NextFunction, Response } from "express";
import {
  CreateSubscriptionFeatureDto,
  CreateSubscriptionPlanDto,
  SubscriptionFeatureQueryDto,
  SubscriptionTransactionQueryDto,
  UpdateSubscriptionFeatureDto,
  UpdateSubscriptionPlanDto,
} from "../dto/subscription.dto";
import { SuccessResponse } from "@/utils/success.response";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import { parsePaginationQuery } from "@/utils/query";
import { SubscriptionPlanQuery } from "@/modules/subscription/interface/subscription.interface";
import { Role } from "@/constants/constant.values.ts/roles";
import { AppError } from "@/utils/appError";
import { SUBSCRIPTION_TYPES } from "../subscription.types";

@injectable()
export class SubscriptionController {
  constructor(
    @inject(SUBSCRIPTION_TYPES.Service)
    private _subscriptionService: ISubscriptionService,
  ) {}

  createSubscriptionFeature = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const body = req.body as CreateSubscriptionFeatureDto;

      await this._subscriptionService.createSubscriptionFeature(body);

      new SuccessResponse(
        STATUS.CREATED,
        MESSAGES.SUBSCRIPTION_PLAN.SUBSCRIPTION_FEATURE_CREATED,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  getAllSubscriptionFeatures = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const query = parsePaginationQuery(req) as SubscriptionFeatureQueryDto;

      const { data, pagination } =
        await this._subscriptionService.getAllSubscriptionFeatures(
          query,
        );

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COMMON.SUCCESS,
        data,
        pagination,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  updateSubscriptionFeature = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;

      const body = req.body as UpdateSubscriptionFeatureDto;

      await this._subscriptionService.updateSubscriptionFeature(
        body,
        id,
      );
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.SUBSCRIPTION_PLAN.SUBSCRIPTION_FEATURE_UPDATED,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  toggleSubscriptionFeatureStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id: subscriptionFeatureId } = req.params;

      const result =
        await this._subscriptionService.toggleSubscriptionFeatureStatus(
          subscriptionFeatureId,
        );

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.SUBSCRIPTION_PLAN.SUBSCRIPTION_FEATURE_STATUS_TOGGLED,
        result.feature,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(
          new Error(
            MESSAGES.SUBSCRIPTION_PLAN
              .SUBSCRIPTION_FEATURE_STATUS_TOGGLED_FAILED,
          ),
        );
      }
    }
  };

  getSubscriptionFeatureById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id: subscriptionFeatureId } = req.params;
      const feature =
        await this._subscriptionService.getSubscriptionFeatureById(
          subscriptionFeatureId,
        );
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.SUBSCRIPTION_PLAN.SUBSCRIPTION_FEATURE_NOT_FOUND,
        feature,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(
          new Error(
            MESSAGES.SUBSCRIPTION_PLAN.SUBSCRIPTION_FEATURE_FETCH_FAILED,
          ),
        );
      }
    }
  };

  //Subscription Plan

  createSubscriptionPlan = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const body = req.body as CreateSubscriptionPlanDto;

      await this._subscriptionService.createSubscriptionPlan(body);

      new SuccessResponse(STATUS.OK, MESSAGES.SUBSCRIPTION_PLAN.CREATED).send(
        res,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error(MESSAGES.SUBSCRIPTION_PLAN.CREATE_FAILED));
      }
    }
  };



  toggleSubscriptionPlanStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      const result =
        await this._subscriptionService.toggleSubscriptionPlanStatus(
          id,
        );
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.SUBSCRIPTION_PLAN.SUBSCRIPTION_PLAN_TOGGLED,
        result.plan,
      ).send(res)
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(
          new Error(MESSAGES.SUBSCRIPTION_PLAN.SUBSCRIPTION_PLAN_TOGGLE_FAILED),
        );
      }
    }
  };

 
  updateSubscriptionPlan = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      const data = req.body as UpdateSubscriptionPlanDto;

      const result = await this._subscriptionService.updateSubscriptionPlan(
        data,
        id,
      );

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.SUBSCRIPTION_PLAN.SUBSCRIPTION_FEATURE_UPDATED,
        result,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(
          new Error(
            MESSAGES.SUBSCRIPTION_PLAN.SUBSCRIPTION_FEATURE_UPDATE_FAILED,
          ),
        );
      }
    }
  };

  //dup
    getSubscriptionPlans = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const query = parsePaginationQuery(req) as SubscriptionPlanQuery;

      const role = req.user?.role as Role;

      const { data, pagination } =
        await this._subscriptionService.getSubscriptionPlans(query, role);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.SUBSCRIPTION_PLAN.FETCHED,
        data,
        pagination,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error(MESSAGES.SUBSCRIPTION_PLAN.FETCH_FAILED));
      }
    }
  };

   getSubscriptionPlanById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      const plan =
        await this._subscriptionService.getSubscriptionPlanById(
          id,
        );

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.SUBSCRIPTION_PLAN.SUBSCRIPTION_PLANS_FETCHED,
        plan,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(error);
      }
    }
  };


  getAllSubscriptionTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const query = parsePaginationQuery(
        req,
      ) as SubscriptionTransactionQueryDto;

      const { data, pagination } =
        await this._subscriptionService.getAllSubscriptionTransactions(
          query,
        );

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.SUBSCRIPTION_PLAN.FETCHED,
        data,
        pagination,
      ).send(res)
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(
          new Error(
            MESSAGES.SUBSCRIPTION_PLAN
              .SUBSCRIPTION_PLAN_TRANSACTIONS_FETCH_FAILED,
          ),
        );
      }
    }
  };

  
  
    createCheckoutSession = async (
      req: AuthRequest,
      res: Response,
      next: NextFunction,
    ) => {
      try {
        if (!req.user?.id) {
          throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
        }
  
        const body = req.body as { subscriptionPlanId?: string };
        const subscriptionPlanId = body.subscriptionPlanId;
        if (!subscriptionPlanId) {
          throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
        }
  
        const result = await this._subscriptionService.createCheckoutSession(
          req.user.id,
          subscriptionPlanId,
        );
  
        new SuccessResponse(
          STATUS.OK,
          MESSAGES.COMMON.SUCCESS,
          result
        ).send(res);
      } catch (error: unknown) {
        if (error instanceof Error) {
          next(error);
        } else {
          next(new Error("Unknown error occurred"));
        }
      }
    };
  
    verifyPayment = async (
      req: AuthRequest,
      res: Response,
      next: NextFunction,
    ) => {
      try {
        const { session_id } = req.query;
        if (!session_id || typeof session_id !== "string") {
          throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.SESSION_ID_REQUIRED);
        }
  
        const result = await this._subscriptionService.verifyPaymentAndSave(
          req.user!.id,
          session_id,
        );
  
        new SuccessResponse(
          STATUS.OK,
          MESSAGES.USER.PAYMENT_VERIFIED,
          result
        ).send(res);
      } catch (error: unknown) {
        if (error instanceof Error) {
          next(error);
        } else {
          next(new Error("Unknown error occurred"));
        }
      }
    };
  
    getActiveSubscription = async (
      req: AuthRequest,
      res: Response,
      next: NextFunction,
    ) => {
      try {
        if (!req.user?.id) {
          throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
        }
  
        const result = await this._subscriptionService.getActiveSubscription(req.user.id);
  
        new SuccessResponse(
          STATUS.OK,
          MESSAGES.COMMON.SUCCESS,
          result
        ).send(res);
      } catch (error: unknown) {
        if (error instanceof Error) {
          next(error);
        } else {
          next(new Error("Unknown error occurred"));
        }
      }
    };

    
      getUserTransactions = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction,
      ) => {
        try {
          if (!req.user?.id) {
            throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
          }
          const query = parsePaginationQuery(req) as SubscriptionTransactionQueryDto

          const userId = req.user.id
          const result = await this._subscriptionService.getUserTransactions(
            userId,
            query,
          );
          new SuccessResponse(
            STATUS.OK,
            MESSAGES.COMMON.SUCCESS,
            result.data,
            result.pagination
          ).send(res);
        } catch (error: unknown) {
          if (error instanceof Error) {
            next(error);
          } else {
            next(new Error("Unknown error occurred"));
          }
        }
      };
    
  
}
