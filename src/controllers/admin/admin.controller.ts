import { NextFunction, Request, Response } from "express";

import { AppError } from "../../utils/appError";
import { parsePaginationQuery } from "../../utils/query";
import { IAdminService } from "../../interfaces/service-interface/admin/admin-service.interface";
import { STATUS } from "../../constants/statuscode";
import { MESSAGES } from "../../constants/messages";
import {
  AdminBlockUnBlockUserDto,
  AdminGetUsersDto,
} from "../../dto/user/user.dto";
import {
  AdminBlockUnblockTrainerDto,
  AdminGetTrainersDto,
  GetTrainerAppointmentsQueryDto,
  RejectTrainerBodyDto,
} from "../../dto/trainer/trainer.dto";
import {
  CategoryQueryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../../dto/category/category.dto";
import {
  CreateSubscriptionFeatureDto,
  CreateSubscriptionPlanDto,
  SubscriptionFeatureQueryDto,
  SubscriptionPlanQueryDto,
  UpdateSubscriptionFeatureDto,
  UpdateSubscriptionPlanDto,
  SubscriptionTransactionQueryDto,
} from "../../dto/subscription/subscription.dto";
import {
  CreateQuestionGroupDto,
  UpdateQuestionGroupDto,
  CreateQuestionDto,
  UpdateQuestionDto,
  QuestionQueryDto,
} from "../../dto/onboarding/onboarding.dto";
import { AuthRequest } from "@/middleware/authGuard";
import { SuccessResponse } from "../../utils/success.response";

export class AdminController {
  constructor(private _adminService: IAdminService) {}

  //Trainer

  getTrainers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as AdminGetTrainersDto;
      const data = await this._adminService.fetchTrainers(query);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.TRAINER.TRAINERS_FETCHED,
        data.data,
        data.pagination
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  blockTrainer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { trainerId } =
        req.params as unknown as AdminBlockUnblockTrainerDto;

      await this._adminService.blockTrainer(trainerId);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.ADMIN.TRAINER_BLOCKED
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  unblockTrainer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { trainerId } =
        req.params as unknown as AdminBlockUnblockTrainerDto;

      await this._adminService.unblockTrainer(trainerId);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.ADMIN.TRAINER_UNBLOCKED
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  //trainer appointment

  getTrainerAppointments = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const query: GetTrainerAppointmentsQueryDto = {
        ...parsePaginationQuery(req),
        ...(req.query.status && { status: req.query.status as string }),
      };

      const result = await this._adminService.getTrainerAppointments(query);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.TRAINER.PROFILE_FETCHED,
        result.data,
        result.pagination
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getTrainerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { profileId } = req.params;

      if (!profileId) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.ADMIN.PROFILE_ID_REQUIRED);
      }

      const trainer = await this._adminService.getTrainerByProfileId(profileId);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.TRAINER.PROFILE_FETCHED,
        trainer
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  approveTrainer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { profileId } = req.params;

      if (!profileId) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.ADMIN.PROFILE_ID_REQUIRED);
      }

      const result = await this._adminService.approveTrainer(profileId);

      new SuccessResponse(
        STATUS.OK,
        result.message,
        result.profile
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  rejectTrainer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { profileId } = req.params;
      const { reason } = req.body as RejectTrainerBodyDto;

      if (!profileId) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.INVALID_ID);
      }

      if (!reason) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          MESSAGES.VALIDATION.REQUIRED_FIELD,
        );
      }

      const result = await this._adminService.rejectTrainer(profileId, reason);

      new SuccessResponse(
        STATUS.OK,
        result.message,
        result.profile
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  //User
  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as unknown as AdminGetUsersDto;
      const data = await this._adminService.fetchUsers(query);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.USER.PROFILE_FETCHED,
        data.data,
        data.pagination
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  blockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as unknown as AdminBlockUnBlockUserDto;

      await this._adminService.blockUser(userId);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.ADMIN.USER_BLOCKED
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  unblockUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as unknown as AdminBlockUnBlockUserDto;

      await this._adminService.unblockUser(userId);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.ADMIN.USER_UNBLOCKED
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  createCategory = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data: CreateCategoryDto = {
        name: req.body.name?.trim(),
        description: req.body.description?.trim(),
        image: req.file,
      };

      await this._adminService.createCategory(data);

      new SuccessResponse(
        STATUS.CREATED,
        MESSAGES.ADMIN.CATEGORY_CREATED
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  updateCategory = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data: UpdateCategoryDto = {
        categoryId: (req.params.categoryId || req.body.categoryId)?.trim(),
        name: req.body.name?.trim(),
        description: req.body.description?.trim(),
        image: req.file,
      };
      console.log("category data backend update...", data);

      await this._adminService.updateCategory(data);

      new SuccessResponse(
        STATUS.CREATED,
        MESSAGES.ADMIN.CATEGORY_UPDATED
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { categoryId } = req.params;
      const category = await this._adminService.getCategoryById(categoryId);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.ADMIN.CATEGORY_FETCHED,
        category
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getAllCategories = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const query: CategoryQueryDto = {
        search: "",
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
        ...parsePaginationQuery(req),
      };

      const { data, pagination } =
        await this._adminService.getAllCategories(query);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.ADMIN.CATEGORY_FETCHED,
        data,
        pagination
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  toggleCategoryStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { categoryId } = req.params;
      const result = await this._adminService.toggleCategoryStatus(categoryId);
      new SuccessResponse(
        STATUS.OK,
        result.message,
        result.category
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getAllSubscriptionFeatures = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const query: SubscriptionFeatureQueryDto = {
        search: "",
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
        ...parsePaginationQuery(req),
      };
      const { data, pagination } =
        await this._adminService.getAllSubscriptionFeatures(query);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COMMON.SUCCESS,
        data,
        pagination
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  createSubscriptionFeature = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data: CreateSubscriptionFeatureDto = {
        title: req.body.title?.trim(),
        description: req.body.description?.trim(),
        type: req.body.type?.trim(),
      };
      await this._adminService.createSubscriptionFeature(data);
      new SuccessResponse(
        STATUS.CREATED,
        MESSAGES.ADMIN.SUBSCRIPTION_FEATURE_CREATED
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  updateSubscriptionFeature = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id: subscriptionFeatureId } = req.params;
      const data: UpdateSubscriptionFeatureDto = {
        subscriptionFeatureId,
        title: req.body.title?.trim(),
        description: req.body.description?.trim(),
        type: req.body.type?.trim(),
      };

      await this._adminService.updateSubscriptionFeature(data);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.ADMIN.SUBSCRIPTION_FEATURE_UPDATED
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  toggleSubscriptionFeatureStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id: subscriptionFeatureId } = req.params;

      const result = await this._adminService.toggleSubscriptionFeatureStatus(
        subscriptionFeatureId,
      );

      new SuccessResponse(
        STATUS.OK,
        result.message,
        result.feature
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getSubscriptionFeatureById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id: subscriptionFeatureId } = req.params;
      const feature = await this._adminService.getSubscriptionFeatureById(
        subscriptionFeatureId,
      );
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.ADMIN.SUBSCRIPTION_FEATURE_FETCHED,
        feature
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  createSubscriptionPlan = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data: CreateSubscriptionPlanDto = {
        name: req.body.name?.trim(),
        description: req.body.description?.trim(),
        price: req.body.price,
        durationInDays: req.body.durationInDays,
        isPopular: req.body.isPopular,
        features: req.body.features,
      };

      await this._adminService.createSubscriptionPlan(data);
      new SuccessResponse(
        STATUS.CREATED,
        MESSAGES.ADMIN.SUBSCRIPTION_PLAN_CREATED
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getAllSubscriptionPlans = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const query: SubscriptionPlanQueryDto = {
        search: "",
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
        ...parsePaginationQuery(req),
      };
      const { data, pagination } =
        await this._adminService.getAllSubscriptionPlans(query);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COMMON.SUCCESS,
        data,
        pagination
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  toggleSubscriptionPlanStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id: subscriptionPlanId } = req.params;

      const result =
        await this._adminService.toggleSubscriptionPlanStatus(
          subscriptionPlanId,
        );

      new SuccessResponse(
        STATUS.OK,
        result.message,
        result.plan
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getSubscriptionPlanById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id: subscriptionPlanId } = req.params;
      const plan =
        await this._adminService.getSubscriptionPlanById(subscriptionPlanId);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.ADMIN.SUBSCRIPTION_PLAN_FETCHED,
        plan
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  updateSubscriptionPlan = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id: subscriptionPlanId } = req.params;
      const data: UpdateSubscriptionPlanDto = {
        subscriptionPlanId,
        name: req.body.name?.trim(),
        description: req.body.description?.trim(),
        price: req.body.price,
        durationInDays: req.body.durationInDays,
        isPopular: req.body.isPopular,
        features: req.body.features,
      };
      await this._adminService.updateSubscriptionPlan(data);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.ADMIN.SUBSCRIPTION_PLAN_UPDATED
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  // Question Groups
  getAllQuestionGroups = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const query = {
        search: "",
        page: 1,
        limit: 10,
        ...parsePaginationQuery(req),
      };
      const { data, pagination } =
        await this._adminService.getAllQuestionGroups(query);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COMMON.SUCCESS,
        data,
        pagination
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  createQuestionGroup = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data: CreateQuestionGroupDto = {
        key: req.body.key?.trim(),
        title: req.body.title?.trim(),
        order: Number(req.body.order),
      };

      await this._adminService.createQuestionGroup(data);
      new SuccessResponse(
        STATUS.CREATED,
        MESSAGES.ONBOARDING.GROUP_CREATED
      ).send(res);
    } catch (error) {
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
      const data: UpdateQuestionGroupDto = {
        title: req.body.title?.trim(),
        order: Number(req.body.order),
      };
      await this._adminService.updateQuestionGroup(id, data);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.ONBOARDING.GROUP_UPDATED
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  toggleQuestionGroupStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await this._adminService.toggleQuestionGroupStatus(req.params.id);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.ONBOARDING.GROUP_STATUS_TOGGLED
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getQuestionGroupById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const group = await this._adminService.getQuestionGroupById(
        req.params.id,
      );
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COMMON.SUCCESS,
        group
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  // Questions
  getAllQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query: QuestionQueryDto = {
        search: "",
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
        ...parsePaginationQuery(req),
        ...(req.query.groupId && { groupId: req.query.groupId.toString() }),
      };
      const { data, pagination } =
        await this._adminService.getAllQuestions(query);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COMMON.SUCCESS,
        data,
        pagination
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  createQuestion = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data: CreateQuestionDto = req.body;
      const adminId = req.user?.id;

      if (!adminId)
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.ADMIN.UNAUTHORIZED_CONTEXT);

      await this._adminService.createQuestion(data, adminId);
      new SuccessResponse(
        STATUS.CREATED,
        MESSAGES.ONBOARDING.QUESTION_CREATED
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  updateQuestion = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await this._adminService.updateQuestion(req.params.id, req.body);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.ONBOARDING.QUESTION_UPDATED
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  toggleQuestionStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await this._adminService.toggleQuestionStatus(req.params.id);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.ONBOARDING.QUESTION_STATUS_TOGGLED
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getQuestionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const question = await this._adminService.getQuestionById(req.params.id);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COMMON.SUCCESS,
        question
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getAllSubscriptionTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const query: SubscriptionTransactionQueryDto = {
        search: "",
        status: "",
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
        ...parsePaginationQuery(req),
        ...(req.query.status && { status: req.query.status.toString().trim() }),
      };

      const { data, pagination } =
        await this._adminService.getAllSubscriptionTransactions(query);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COMMON.SUCCESS,
        data,
        pagination
      ).send(res);
    } catch (error) {
      next(error);
    }
  };
}
