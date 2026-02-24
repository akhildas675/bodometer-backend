import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/authGuard";
import { ITrainerProfileService } from "../../interfaces/trainer/trainer.profile-service.interface";
import { STATUS } from "../../constants/statuscode";
import { MESSAGES } from "../../constants/messages";
import { AppError } from "../../utils/appError";
import { success } from "zod";
import { ROLES } from "../../constants/identity.constants";

export default class TrainerProfileController {
  constructor(private _trainerProfileService: ITrainerProfileService) {}

  createProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }

      const { experienceInYears, bio } = req.body;
      const certificateFile = req.file;

      if (!certificateFile) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.TRAINER.CERTIFICATE_REQUIRED); 
      }

      await this._trainerProfileService.createProfile(req.user.id, {
        experienceInYears: Number(experienceInYears),
        bio,
        certificateFile,
      });

      return res.status(STATUS.CREATED).json({
        success: true,
        message: MESSAGES.TRAINER.PROFILE_CREATED,
      });
    } catch (err) {
      next(err);
    }
  };
  getProfileStatus = async(req:AuthRequest,res:Response,next:NextFunction)=>{
      try {
        if (!req.user) {
          throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
        }
        const userId = req.user.id;
  
        const profileStatus = await this._trainerProfileService.getTrainerStatus(userId);
        console.log("profile Status of trainer",profileStatus)
        return res.status(STATUS.OK).json({
          success:true,
          data:profileStatus
        })
      } catch (err) {
        next(err)
      }
  }
};
