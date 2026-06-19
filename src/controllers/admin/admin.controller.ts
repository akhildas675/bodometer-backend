import { NextFunction, Request, Response } from "express";

import { AppError } from "../../utils/appError";
import { parsePaginationQuery } from "../../utils/query";
import { IAdminService } from "../../interfaces/service-interface/admin/admin-service.interface";
import { STATUS } from "../../constants/statuscode";
import { FeatureType } from "../../constants/subscription.constant";
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
  QuestionQueryDto,
  UpdateQuestionDto,
} from "../../dto/onboarding/onboarding.dto";
import { AuthRequest } from "@/middleware/authGuard";
import { SuccessResponse } from "@/utils/success.response";
import {
  CreateTargetMuscleDto,
  TargetMuscleQueryDto,
  UpdateTargetMuscleDto,
} from "@/dto/target.muscles/target-muscles.dto";
import {
  CreateEquipmentDto,
  EquipmentQueryDto,
  UpdateEquipmentDto,
} from "@/dto/equipment/equipment.dto";
import { BodyRegion } from "@/constants/fitness.constant";
import {
  CreateExerciseDto,
  ExerciseQueryDto,
  UpdateExerciseDto,
} from "@/dto/exercise/exercise.dto";
import { MealCategoryDto, UpdateMealCategoryDto } from "@/dto/meal.category/meal-category.dto";

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
        data.pagination,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  blockTrainer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { trainerId } =
        req.params as unknown as AdminBlockUnblockTrainerDto;

      await this._adminService.blockTrainer(trainerId);

      new SuccessResponse(STATUS.OK, MESSAGES.ADMIN.TRAINER_BLOCKED).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  unblockTrainer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { trainerId } =
        req.params as unknown as AdminBlockUnblockTrainerDto;

      await this._adminService.unblockTrainer(trainerId);

      new SuccessResponse(STATUS.OK, MESSAGES.ADMIN.TRAINER_UNBLOCKED).send(
        res,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
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
        result.pagination,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  getTrainerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { profileId } = req.params;

      if (!profileId) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          MESSAGES.ADMIN.PROFILE_ID_REQUIRED,
        );
      }

      const trainer = await this._adminService.getTrainerByProfileId(profileId);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.TRAINER.PROFILE_FETCHED,
        trainer,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  approveTrainer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { profileId } = req.params;

      if (!profileId) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          MESSAGES.ADMIN.PROFILE_ID_REQUIRED,
        );
      }

      const result = await this._adminService.approveTrainer(profileId);

      new SuccessResponse(STATUS.OK, result.message, result.profile).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  rejectTrainer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { profileId } = req.params;
      const { reason } = req.body as unknown as RejectTrainerBodyDto;

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

      new SuccessResponse(STATUS.OK, result.message, result.profile).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
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
        data.pagination,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  blockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as unknown as AdminBlockUnBlockUserDto;

      await this._adminService.blockUser(userId);

      new SuccessResponse(STATUS.OK, MESSAGES.ADMIN.USER_BLOCKED).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  unblockUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as unknown as AdminBlockUnBlockUserDto;

      await this._adminService.unblockUser(userId);

      new SuccessResponse(STATUS.OK, MESSAGES.ADMIN.USER_UNBLOCKED).send(res);
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

  createSubscriptionFeature = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const body = req.body as {
        title?: string;
        description?: string;
        type?: FeatureType;
      };
      const data: CreateSubscriptionFeatureDto = {
        title: body.title?.trim() || "",
        description: body.description?.trim() || "",
        type: body.type || "boolean",
      };
      await this._adminService.createSubscriptionFeature(data);
      new SuccessResponse(
        STATUS.CREATED,
        MESSAGES.ADMIN.SUBSCRIPTION_FEATURE_CREATED,
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
      const { id: subscriptionFeatureId } = req.params;
      const body = req.body as {
        title?: string;
        description?: string;
        type?: FeatureType;
      };
      const data: UpdateSubscriptionFeatureDto = {
        subscriptionFeatureId,
        title: body.title?.trim(),
        description: body.description?.trim(),
        type: body.type,
      };

      await this._adminService.updateSubscriptionFeature(data);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.ADMIN.SUBSCRIPTION_FEATURE_UPDATED,
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

      const result = await this._adminService.toggleSubscriptionFeatureStatus(
        subscriptionFeatureId,
      );

      new SuccessResponse(STATUS.OK, result.message, result.feature).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
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
      const feature = await this._adminService.getSubscriptionFeatureById(
        subscriptionFeatureId,
      );
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.ADMIN.SUBSCRIPTION_FEATURE_FETCHED,
        feature,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  createSubscriptionPlan = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const body = req.body as {
        name?: string;
        description?: string;
        price?: number;
        durationInDays?: number;
        isPopular?: boolean;
        features?: Array<{
          featureId: string;
          limit?: number;
          limitType?: string;
        }>;
      };
      const data: CreateSubscriptionPlanDto = {
        name: body.name?.trim() || "",
        description: body.description?.trim() || "",
        price: body.price ?? 0,
        durationInDays: body.durationInDays ?? 0,
        isPopular: body.isPopular ?? false,
        features: body.features ?? [],
      };

      await this._adminService.createSubscriptionPlan(data);
      new SuccessResponse(
        STATUS.CREATED,
        MESSAGES.ADMIN.SUBSCRIPTION_PLAN_CREATED,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
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

      new SuccessResponse(STATUS.OK, result.message, result.plan).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
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
        plan,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  updateSubscriptionPlan = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id: subscriptionPlanId } = req.params;
      const body = req.body as {
        name?: string;
        description?: string;
        price?: number;
        durationInDays?: number;
        isPopular?: boolean;
        features?: Array<{
          featureId: string;
          limit?: number;
          limitType?: string;
        }>;
      };
      const data: UpdateSubscriptionPlanDto = {
        subscriptionPlanId,
        name: body.name?.trim(),
        description: body.description?.trim(),
        price: body.price,
        durationInDays: body.durationInDays,
        isPopular: body.isPopular,
        features: body.features,
      };
      await this._adminService.updateSubscriptionPlan(data);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.ADMIN.SUBSCRIPTION_PLAN_UPDATED,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
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
        key: body.key?.trim() || "",
        title: body.title?.trim() || "",
        order: Number(body.order),
      };

      await this._adminService.createQuestionGroup(data);
      new SuccessResponse(
        STATUS.CREATED,
        MESSAGES.ONBOARDING.GROUP_CREATED,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
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
      await this._adminService.updateQuestionGroup(id, data);
      new SuccessResponse(STATUS.OK, MESSAGES.ONBOARDING.GROUP_UPDATED).send(
        res,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
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
        MESSAGES.ONBOARDING.GROUP_STATUS_TOGGLED,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
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
      new SuccessResponse(STATUS.OK, MESSAGES.COMMON.SUCCESS, group).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
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
        ...(typeof req.query.groupId === "string" && {
          groupId: req.query.groupId,
        }),
      };
      const { data, pagination } =
        await this._adminService.getAllQuestions(query);
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

  createQuestion = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data: CreateQuestionDto = req.body as unknown as CreateQuestionDto;
      const adminId = req.user?.id;

      if (!adminId)
        throw new AppError(
          STATUS.UNAUTHORIZED,
          MESSAGES.ADMIN.UNAUTHORIZED_CONTEXT,
        );

      await this._adminService.createQuestion(data, adminId);
      new SuccessResponse(
        STATUS.CREATED,
        MESSAGES.ONBOARDING.QUESTION_CREATED,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  updateQuestion = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await this._adminService.updateQuestion(
        req.params.id,
        req.body as unknown as UpdateQuestionDto,
      );

      new SuccessResponse(STATUS.OK, MESSAGES.ONBOARDING.QUESTION_UPDATED).send(
        res,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
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
        MESSAGES.ONBOARDING.QUESTION_STATUS_TOGGLED,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  getQuestionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const question = await this._adminService.getQuestionById(req.params.id);
      new SuccessResponse(STATUS.OK, MESSAGES.COMMON.SUCCESS, question).send(
        res,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
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
        ...(typeof req.query.status === "string" && {
          status: req.query.status.trim(),
        }),
      };

      const { data, pagination } =
        await this._adminService.getAllSubscriptionTransactions(query);

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

  getQuestionDataSources = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const dataSources = await this._adminService.getQuestionDataSources();
      new SuccessResponse(STATUS.OK, MESSAGES.COMMON.SUCCESS, dataSources).send(
        res,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  createTargetMuscle = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const body = req.body as CreateTargetMuscleDto;
      const data: CreateTargetMuscleDto = {
        title: body.title,
        description: body.description,
        bodyRegion: body.bodyRegion,
        image: req.file,
      };

      const result = await this._adminService.createTargetMuscle(data);
      new SuccessResponse(
        STATUS.CREATED,
        "Target muscle created successfully.",
        result,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };
  getAllTargetMuscles = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const query = parsePaginationQuery(req) as TargetMuscleQueryDto;
      const { data, pagination } =
        await this._adminService.getAllTargetMuscles(query);
      new SuccessResponse(
        STATUS.OK,
        "Target muscles fetched successfully.",
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

  getTargetMuscleById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const targetMuscleId = String(req.params.id);
      const data = await this._adminService.getTargetMuscleById(targetMuscleId);
      new SuccessResponse(
        STATUS.OK,
        "Target muscle fetched successfully.",
        data,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  toggleTargetMuscleStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const targetMuscleId = String(req.params.id);
      const data =
        await this._adminService.toggleTargetMuscleStatus(targetMuscleId);
      new SuccessResponse(STATUS.OK, data.message, data).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  updateTargetMuscle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const targetMuscleId = String(req.params.id);
      const body = req.body as {
        title?: string;
        description?: string;
        bodyRegion?: BodyRegion;
      } as UpdateTargetMuscleDto;

      const dto = {
        targetMuscleId,
        title: body.title,
        description: body.description,
        bodyRegion: body.bodyRegion,
        image: req.file,
      };

      const data = await this._adminService.updateTargetMuscle(
        targetMuscleId,
        dto,
      );
      new SuccessResponse(
        STATUS.OK,
        "Target muscle updated successfully.",
        data,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  // Equipment Methods

  createEquipment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as {
        title?: string;
        description?: string;
      } as CreateEquipmentDto;

      const dto = {
        title: body.title,
        description: body.description,
        image: req.file,
      };

      const data = await this._adminService.createEquipment(dto);
      new SuccessResponse(
        STATUS.CREATED,
        "Equipment created successfully.",
        data,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  getAllEquipment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as unknown as EquipmentQueryDto;
      const { data, pagination } = await this._adminService.getAllEquipment(query);

      new SuccessResponse(
        STATUS.OK,
        "Equipment list fetched successfully.",
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

  getEquipmentById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const equipmentId = String(req.params.id);
      const data = await this._adminService.getEquipmentById(equipmentId);
      new SuccessResponse(
        STATUS.OK,
        "Equipment fetched successfully.",
        data,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  toggleEquipmentStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const equipmentId = String(req.params.id);
      const data = await this._adminService.toggleEquipmentStatus(equipmentId);
      new SuccessResponse(STATUS.OK, data.message, data).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  updateEquipment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const equipmentId = String(req.params.id);
      const dto = req.body as UpdateEquipmentDto;
      dto.equipmentId = equipmentId;
      dto.image = req.file;


      const data = await this._adminService.updateEquipment(equipmentId, dto);
      new SuccessResponse(
        STATUS.OK,
        "Equipment updated successfully.",
        data,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  // Exercise Methods

  createExercise = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const dto = req.body as CreateExerciseDto;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      dto.image = files?.["image"]?.[0];
      dto.video = files?.["video"]?.[0];


      await this._adminService.createExercise(dto);

      new SuccessResponse(
        STATUS.CREATED,
        "Exercise created successfully.",
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  getAllExercises = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as unknown as ExerciseQueryDto;
      const { data, pagination } = await this._adminService.getAllExercises(query);


      new SuccessResponse(
        STATUS.OK,
        "Exercises fetched successfully.",
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

  getExerciseById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const exerciseId = String(req.params.id);
      const data = await this._adminService.getExerciseById(exerciseId);
      new SuccessResponse(
        STATUS.OK,
        "Exercise fetched successfully.",
        data,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  toggleExerciseStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const exerciseId = String(req.params.id);
      const data = await this._adminService.toggleExerciseStatus(exerciseId);
      new SuccessResponse(STATUS.OK, data.message, data).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  updateExercise = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const exerciseId = String(req.params.id);
      const dto = req.body as UpdateExerciseDto;
      dto.exerciseId = exerciseId;

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      dto.image = files?.["image"]?.[0];
      dto.video = files?.["video"]?.[0];


      await this._adminService.updateExercise(exerciseId, dto);

      new SuccessResponse(STATUS.OK, "Exercise updated successfully.").send(
        res,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  createMealCategory = async(req:AuthRequest,res:Response,next:NextFunction)=>{
    try {
      const data = req.body as MealCategoryDto;

      await this._adminService.createMealCategory(data);
      new SuccessResponse(STATUS.CREATED,MESSAGES.MEAL_CATEGORY.CREATED).send(res)
      
    } catch (error:unknown) {
       if(error instanceof Error){

        next(error);
    }else{
      next(new Error("Failed to create Meal Category"))
    }
    }
  }

  getAllMealCategories = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as "asc" | "desc",
        status: req.query.status as string,
      };
      const { data, pagination } = await this._adminService.getAllMealCategories(query);
      new SuccessResponse(
        STATUS.OK, 
        "Meal Categories fetched successfully", 
        data, 
        pagination
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  getMealCategoryById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this._adminService.getMealCategoryById(id);
      new SuccessResponse(STATUS.OK, "Meal Category fetched successfully", result).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  updateMealCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = req.body as UpdateMealCategoryDto;
      await this._adminService.updateMealCategory(id, data);
      new SuccessResponse(STATUS.OK, "Meal Category updated successfully").send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  toggleMealCategoryStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this._adminService.toggleMealCategoryStatus(id);
      new SuccessResponse(STATUS.OK, result.message, result).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };
}
