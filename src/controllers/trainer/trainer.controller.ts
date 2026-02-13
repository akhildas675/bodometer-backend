import { NextFunction, Request, Response } from "express";
import { ITrainerService } from "../../interfaces/trainer/trainer-service.interface";
import { AuthRequest } from "../../middleware/authGuard";
import { AppError } from "../../utils/appError";
import { STATUS } from "../../constants/statuscode";
import { UpdateTrainerProfileDto } from "../../dto/trainer/trainer.dto";


export class TrainerController {
  constructor(private _trainerService: ITrainerService) { }


  getTrainer = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {

      if (!req.user) {
        throw new AppError(STATUS.UNAUTHORIZED, "User not authenticated");
      }

      console.log("hit here")

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
}
