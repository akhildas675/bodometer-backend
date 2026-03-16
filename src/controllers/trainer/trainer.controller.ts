import { NextFunction, Request, Response } from "express";
import { ITrainerService } from "@/interfaces/trainer/trainer-service.interface";
import { AuthRequest } from "@/middleware/authGuard";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/statuscode";
import { TrainerProfileDto, UpdateTrainerProfileDto } from "@/dto/trainer/trainer.dto";
import { MESSAGES } from "@/constants/messages";


export class TrainerController {
  constructor(private _trainerService: ITrainerService) { }


  getTrainer = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {

      if (!req.user) {
        throw new AppError(STATUS.UNAUTHORIZED, "User not authenticated");
      }

      const trainerId = req.user.id;
      const trainer = await this._trainerService.fetchTrainer(trainerId)

      res.status(STATUS.OK).json({
        success: true,
        data: trainer,
      });

    } catch (error) {
      next(error)
    }
  }


  updateProfile =async(req:AuthRequest,res:Response,next:NextFunction)=>{
    try {

       if (!req.user) {
        throw new AppError(STATUS.UNAUTHORIZED, "User not authenticated");
      }


      const trainerId = req.user.id;

      const updateData:UpdateTrainerProfileDto = req.body;

      const updatedTrainer = await this._trainerService.updateTrainerProfile(trainerId,updateData)

      res.status(STATUS.OK).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedTrainer,
      });
      
    } catch (error) {
      next(error)
    }
  }

   uploadProfilePicture = async (
      req: AuthRequest,
      res: Response,
      next: NextFunction,
    ) => {
      try {
        if (!req.user) {
          throw new AppError(STATUS.UNAUTHORIZED, "Trainer not authenticated");
        }
  
        if (!req.file) {
          throw new AppError(STATUS.BAD_REQUEST, "No file uploaded");
        }
  
        const trainerId = req.user.id;
        const file = req.file;
  
        const profilePicUrl = await this._trainerService.uploadTrainerProfilePicture(
          trainerId,
          file,
        );
  
        res.status(STATUS.OK).json({
          success: true,
          message: "Trainer Profile picture uploaded successfully",
          data: {
            url: profilePicUrl,
          },
        });
      } catch (error) {
        next(error);
      }
    };


  getWorkoutList = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const workoutList = await this._trainerService.fetchWorkoutList();
      res.status(STATUS.OK).json({
        success: true,
        data: workoutList,
      });
    } catch (error) {
      next(error);
    }
  };


  //Trainer profile

  
createProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
    }

    const { dateOfBirth, gender, experience, bio, specializationIds } = req.body;

    
    // Debug logs
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Body:", req.body);
    console.log("Files:", req.files);

    const files = req.files as Record<string, Express.Multer.File[]> | undefined;

    const profileImageFile = files?.profileImage?.[0];
    const certificateFile = files?.certificate?.[0];

    if (!profileImageFile) {
      throw new AppError(STATUS.BAD_REQUEST, "Profile image is required");
    }

    if (!certificateFile) {
      throw new AppError(STATUS.BAD_REQUEST, "Certificate is required");
    }

    const specializationArray = Array.isArray(specializationIds)
      ? specializationIds
      : [specializationIds];
      
      const data: TrainerProfileDto = {
      profileImageFile,
      certificateFile,
      dateOfBirth,
      gender,
      experienceInYears: Number(experience),
      bio,
      specializationIds: specializationArray,
    };
    console.log("data from the appointment...",data)

    await this._trainerService.createProfile(req.user.id, data);

    return res.status(STATUS.CREATED).json({
      success: true,
      message: "Trainer profile created successfully",
    });

  } catch (error) {
    next(error);
  }
};
  getProfileStatus = async(req:AuthRequest,res:Response,next:NextFunction)=>{
      try {
        if (!req.user) {
          throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
        }
        const userId = req.user.id;

        const profileStatus = await this._trainerService.getTrainerStatus(userId);
        return res.status(STATUS.OK).json({
          success:true,
          data:profileStatus
        })
      } catch (err) {
        next(err)
      }
  }
}
