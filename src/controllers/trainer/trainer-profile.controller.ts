import { NextFunction, Response } from "express";
import { AuthRequest } from "@/middleware/authGuard";
import { ITrainerProfileService } from "@/interfaces/trainer/trainer.profile-service.interface";
import { STATUS } from "@/constants/statuscode";
import { MESSAGES } from "@/constants/messages";
import { AppError } from "@/utils/appError";
import { TrainerProfileDto } from "@/dto/trainer/trainer-profile.dto";


export default class TrainerProfileController {
  constructor(private _trainerProfileService: ITrainerProfileService) { }

  createProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }


      const { dateOfBirth, gender, experience, bio, specializationIds } = req.body;
      const files = req.files as Record<string, Express.Multer.File[]>;
      const profileImageFile = files?.["profileImage"]?.[0];
      const certificateFile = files?.["certificate"]?.[0];
      if (!profileImageFile) {
        throw new AppError(STATUS.BAD_REQUEST, "Profile image is required");
      }
      if (!certificateFile) {
        throw new AppError(STATUS.BAD_REQUEST, "Certificate is required");
      }

      const data: TrainerProfileDto = {
        profileImageFile,
        certificateFile,
        dateOfBirth,
        gender,
        experienceInYears: Number(experience),
        bio,
        specializationIds: Array.isArray(specializationIds)
          ? specializationIds
          : [specializationIds],
      };


      const result = await this._trainerProfileService.createProfile(req.user.id,data)





      return res.status(STATUS.CREATED).json({ success: true });
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
        return res.status(STATUS.OK).json({
          success:true,
          data:profileStatus
        })
      } catch (err) {
        next(err)
      }
  }
};
