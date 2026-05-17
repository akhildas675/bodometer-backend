import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../../middleware/authGuard";
import { Logger } from "../../utils/logger";
import { IUserService } from "../../interfaces/service-interface/user/user-service.interface";
import { AppError } from "../../utils/appError";
import { STATUS } from "../../constants/statuscode";
import { MESSAGES } from "../../constants/messages";
import { ChangePasswordDto, GetTrainersQueryDto, UpdateUserProfileDto } from "../../dto/user/user.dto";
import { success } from "zod";


export class UserController {

  private logger = new Logger("UserController");
  constructor(private _userService: IUserService) { }

  getUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }

      const userId = req.user.id;
      const user = await this._userService.fetchUser(userId);

      res.status(STATUS.OK).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }

      const userId = req.user.id;
      const updateData: UpdateUserProfileDto = req.body;

      const updatedUser = await this._userService.updateProfile(
        userId,
        updateData,
      );

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.USER.PROFILE_UPDATED,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  };

  uploadProfilePicture = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }

      if (!req.file) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          MESSAGES.VALIDATION.REQUIRED_FIELD,
        );
      }

      const userId = req.user.id;
      const file = req.file;

      const profilePicUrl = await this._userService.uploadProfilePicture(
        userId,
        file,
      );

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.USER.PROFILE_PICTURE_UPDATED,
        data: {
          url: profilePicUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user)
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      const dto: ChangePasswordDto = {
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword,
      };
      await this._userService.changePassword(req.user.id, dto);
      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.PASSWORD.CHANGED_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  };


  getTrainers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const query: GetTrainersQueryDto = {};
      if (req.query.page) query.page = Number(req.query.page);
      if (req.query.limit) query.limit = Number(req.query.limit);
      if (req.query.search) query.search = String(req.query.search);
      if (req.query.sortBy) query.sortBy = String(req.query.sortBy);
      if (req.query.sortOrder)
        query.sortOrder = req.query.sortOrder as "asc" | "desc";
      if (req.query.specializationId)
        query.specializationId = String(req.query.specializationId);

      const result = await this._userService.getTrainers(query);
      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.COMMON.SUCCESS,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };
  getTrainerById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;

 
      if (!id) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
      }

      const result = await this._userService.getTrainerById(id);

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.COMMON.SUCCESS,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getCategories = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const query: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: "asc" | "desc" } = {};
      if (req.query.page) query.page = Number(req.query.page);
      if (req.query.limit) query.limit = Number(req.query.limit);
      if (req.query.search) query.search = String(req.query.search);
      if (req.query.sortBy) query.sortBy = String(req.query.sortBy);
      if (req.query.sortOrder) query.sortOrder = req.query.sortOrder as "asc" | "desc";


      const result = await this._userService.getCategories(query);
      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.COMMON.SUCCESS,
        data: result.data,
        pagination: result.pagination,
      });

    } catch (error) {
      next(error);
    }
  };

  getCategoryById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { categoryId } = req.params;

     
      if (!categoryId) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
      }

      const result = await this._userService.getCategoryById(categoryId);
     
      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.COMMON.SUCCESS,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };


  getMySubscriptions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {

   
      if (!req.user?.id) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.USER.USER_NOT_FOUND)

      }

      const result = await this._userService.getMySubscriptions()

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.COMMON.SUCCESS,
        data: result
      })
    } catch (error) {
      next(error);
    }
  }

  createCheckoutSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
    }
 
    const { planId } = req.body;
    if (!planId) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
    }
 

    const result = await this._userService.createCheckoutSession(req.user.id, planId);
 
    res.status(STATUS.OK).json({
      success: true,
      message: MESSAGES.COMMON.SUCCESS,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
 

  verifyPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { session_id } = req.query;
      if (!session_id || typeof session_id !== "string") {
        throw new AppError(STATUS.BAD_REQUEST, "Missing session_id");
      }

      const result = await this._userService.verifyPaymentAndSave(req.user!.id, session_id);

      res.status(STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getActiveSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }

      const result = await this._userService.getActiveSubscription(req.user.id);

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.COMMON.SUCCESS,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getOnboardingGroups = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this._userService.getOnboardingGroups();
      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.COMMON.SUCCESS,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  getOnboardingQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this._userService.getOnboardingQuestions();
      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.COMMON.SUCCESS,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  submitOnboarding = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }
      await this._userService.submitOnboarding(req.user.id, req.body);
      res.status(STATUS.OK).json({
        success: true,
        message: "Onboarding answers saved successfully"
      });
    } catch (error) {
      next(error);
    }
  };

  getOnboardingStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }
      const result = await this._userService.getOnboardingStatus(req.user.id);
      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.COMMON.SUCCESS,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getOnboardingAnswers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }
      const result = await this._userService.getOnboardingAnswers(req.user.id);
      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.COMMON.SUCCESS,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}
