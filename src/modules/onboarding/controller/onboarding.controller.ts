import { NextFunction, Response } from "express";
import { inject, injectable } from "inversify";
import { AuthRequest } from "@/middleware/authGuard";
import { IOnboardingService } from "../interface/onboarding-service.interface";
import { ONBOARDING_TYPES } from "../onboarding.types";
import { SuccessResponse } from "@/utils/success.response";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import { AppError } from "@/utils/appError";
import { parsePaginationQuery } from "@/utils/query";
import {
  CreateQuestionGroupDto,
  UpdateQuestionGroupDto,
  CreateQuestionDto,
  UpdateQuestionDto,
  QuestionQueryDto,
} from "../dto/onboarding.dto";
import { ROLES } from "@/constants/constant.values.ts/roles";

@injectable()
export class OnboardingController {
  constructor(
    @inject(ONBOARDING_TYPES.Service)
    private _onboardingService: IOnboardingService,
  ) {}



  createQuestionGroup = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const body = req.body as {
        key?: string;
        title?: string;
        order?: number | string;
      };
      const data: CreateQuestionGroupDto = {
        key: body.key?.trim() || undefined,
        title: body.title?.trim() || "",
        order: Number(body.order),
      };

      await this._onboardingService.createQuestionGroup(data);
      new SuccessResponse(
        STATUS.CREATED,
        MESSAGES.ONBOARDING.GROUP_CREATED,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  updateQuestionGroup = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      const body = req.body as { title?: string; order?: number | string };
      const data: UpdateQuestionGroupDto = {
        title: body.title?.trim() || "",
        order: Number(body.order) || 0,
      };

      await this._onboardingService.updateQuestionGroup(id, data);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.ONBOARDING.GROUP_UPDATED,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  toggleQuestionGroupStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      await this._onboardingService.toggleQuestionGroupStatus(id);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.ONBOARDING.GROUP_STATUS_TOGGLED,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  getQuestionGroupById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      const group = await this._onboardingService.getQuestionGroupById(id);
      new SuccessResponse(STATUS.OK, MESSAGES.COMMON.SUCCESS, group).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  getAllQuestionGroups = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const query = parsePaginationQuery(req);
      const result = await this._onboardingService.getAllQuestionGroups(query);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COMMON.SUCCESS,
        result.data,
        result.pagination,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  createQuestion = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data = req.body as CreateQuestionDto;
      const adminId = req.user?.id;

      if (!adminId) {
        throw new AppError(
          STATUS.UNAUTHORIZED,
          MESSAGES.ADMIN.UNAUTHORIZED_CONTEXT,
        );
      }

      await this._onboardingService.createQuestion(data, adminId);
      new SuccessResponse(
        STATUS.CREATED,
        MESSAGES.ONBOARDING.QUESTION_CREATED,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  updateQuestion = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      const data = req.body as UpdateQuestionDto;

      await this._onboardingService.updateQuestion(id, data);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.ONBOARDING.QUESTION_UPDATED,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  toggleQuestionStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      await this._onboardingService.toggleQuestionStatus(id);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.ONBOARDING.QUESTION_STATUS_TOGGLED,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  getQuestionById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      const question = await this._onboardingService.getQuestionById(id);
      new SuccessResponse(STATUS.OK, MESSAGES.COMMON.SUCCESS, question).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  getQuestions = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const query = {
        ...parsePaginationQuery(req),
        ...(req.query.groupId && { groupId: String(req.query.groupId) }),
      } as QuestionQueryDto;
      const isAdmin = req.user?.role === ROLES.ADMIN;

      if (!isAdmin) {
        query.isActive = true;
      }

      const result = await this._onboardingService.getAllQuestions(query);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COMMON.SUCCESS,
        result.data,
        result.pagination,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  getQuestionDataSources = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const dataSources = await this._onboardingService.getQuestionDataSources();
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COMMON.SUCCESS,
        dataSources,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };


  submitOnboarding = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }

      const data = req.body as Parameters<IOnboardingService["submitOnboarding"]>[1];
      await this._onboardingService.submitOnboarding(userId, data);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.USER.ONBOARDING_SAVED,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  getOnboardingStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }

      const result = await this._onboardingService.getOnboardingStatus(userId);
      new SuccessResponse(STATUS.OK, MESSAGES.COMMON.SUCCESS, result).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  getOnboardingAnswers = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }

      const result = await this._onboardingService.getOnboardingAnswers(userId);
      new SuccessResponse(STATUS.OK, MESSAGES.COMMON.SUCCESS, result).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };
}
