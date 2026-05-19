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

export class AdminController {
  constructor(private _adminService: IAdminService) {}

  //Trainer

  getTrainers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as AdminGetTrainersDto;
      const data = await this._adminService.fetchTrainers(query);
      res.status(200).json({
        success: true,
        data: data.data,
        pagination: data.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  blockTrainer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { trainerId } =
        req.params as unknown as AdminBlockUnblockTrainerDto;

      await this._adminService.blockTrainer(trainerId);

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.ADMIN.TRAINER_BLOCKED,
      });
    } catch (error) {
      next(error);
    }
  };

  unblockTrainer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { trainerId } =
        req.params as unknown as AdminBlockUnblockTrainerDto;

      await this._adminService.unblockTrainer(trainerId);

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.ADMIN.TRAINER_UNBLOCKED,
      });
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
    const query: GetTrainerAppointmentsQueryDto = {
      ...parsePaginationQuery(req),
      ...(req.query.status && { status: req.query.status as string }),
    };

    const result = await this._adminService.getTrainerAppointments(query);
    res.status(STATUS.OK).json({
      success: true,
      message: MESSAGES.TRAINER.PROFILE_FETCHED,
      data: result.data,
      pagination: result.pagination,
    });
  };
  getTrainerById = async (req: Request, res: Response, next: NextFunction) => {
    const { profileId } = req.params;

    if (!profileId) {
      throw new AppError(STATUS.BAD_REQUEST, "Profile ID is required");
    }

    const trainer = await this._adminService.getTrainerByProfileId(profileId);

    res.status(STATUS.OK).json({
      success: true,
      message: MESSAGES.TRAINER.PROFILE_FETCHED,
      data: trainer,
    });
  };

  approveTrainer = async (req: Request, res: Response, next: NextFunction) => {
    const { profileId } = req.params;

    if (!profileId) {
      throw new AppError(STATUS.BAD_REQUEST, "Profile ID is required");
    }

    const result = await this._adminService.approveTrainer(profileId);

    res.status(STATUS.OK).json({
      success: true,
      message: result.message,
      data: result.profile,
    });
  };

  rejectTrainer = async (req: Request, res: Response, next: NextFunction) => {
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

    res.status(STATUS.OK).json({
      success: true,
      message: result.message,
      data: result.profile,
    });
  };

  //User
  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as unknown as AdminGetUsersDto;
      const data = await this._adminService.fetchUsers(query);

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.USER.PROFILE_FETCHED,
        data: data.data,
        pagination: data.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  blockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as unknown as AdminBlockUnBlockUserDto;

      await this._adminService.blockUser(userId);

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.ADMIN.USER_BLOCKED,
      });
    } catch (error) {
      next(error);
    }
  };

  unblockUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as unknown as AdminBlockUnBlockUserDto;

      await this._adminService.unblockUser(userId);

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.ADMIN.USER_UNBLOCKED,
      });
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

      res.status(201).json({
        message: MESSAGES.ADMIN.CATEGORY_CREATED,
      });
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

      res.status(201).json({
        message: MESSAGES.ADMIN.CATEGORY_UPDATED,
      });
    } catch (error) {
      next(error);
    }
  };

  getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { categoryId } = req.params;
      const category = await this._adminService.getCategoryById(categoryId);
      res.status(200).json({
        success: true,
        message: MESSAGES.ADMIN.CATEGORY_FETCHED,
        data: category,
      });
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

      res.status(200).json({
        success: true,
        data,
        pagination,
      });
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
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.category,
      });
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
      res.status(200).json({
        success: true,
        data,
        pagination,
      });
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
      res.status(201).json({
        success: true,
        message: MESSAGES.ADMIN.SUBSCRIPTION_FEATURE_CREATED,
      });
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

      res.status(200).json({
        success: true,
        message: MESSAGES.ADMIN.SUBSCRIPTION_FEATURE_UPDATED,
      });
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

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.feature,
      });
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
      res.status(200).json({
        success: true,
        message: MESSAGES.ADMIN.SUBSCRIPTION_FEATURE_FETCHED,
        data: feature,
      });
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
      res.status(201).json({
        success: true,
        message: MESSAGES.ADMIN.SUBSCRIPTION_PLAN_CREATED,
      });
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
      res.status(200).json({
        success: true,
        data,
        pagination,
      });
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

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.plan,
      });
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
      res.status(200).json({
        success: true,
        message: MESSAGES.ADMIN.SUBSCRIPTION_PLAN_FETCHED,
        data: plan,
      });
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
      res.status(200).json({
        success: true,
        message: MESSAGES.ADMIN.SUBSCRIPTION_PLAN_UPDATED,
      });
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
      res.status(200).json({ success: true, data, pagination });
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
      res.status(201).json({
        success: true,
        message: "Question group created successfully",
      });
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
      res.status(200).json({
        success: true,
        message: "Question group updated successfully",
      });
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
      res.status(200).json({ success: true, message: "Group status updated" });
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
      res.status(200).json({ success: true, data: group });
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
      res.status(200).json({ success: true, data, pagination });
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
        throw new AppError(STATUS.UNAUTHORIZED, "Unauthorized context");

      await this._adminService.createQuestion(data, adminId);
      res
        .status(201)
        .json({ success: true, message: "Question created successfully" });
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

      res
        .status(200)
        .json({ success: true, message: "Question updated successfully" });
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
      res
        .status(200)
        .json({ success: true, message: "Question status updated" });
    } catch (error) {
      next(error);
    }
  };

  getQuestionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const question = await this._adminService.getQuestionById(req.params.id);
      res.status(200).json({ success: true, data: question });
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

      res.status(STATUS.OK).json({
        success: true,
        data,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  };
}
