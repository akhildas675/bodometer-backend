import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/authGuard";
import { TrainerProfileMapper } from "../../mappers/trainer/trainer-profile.mapper";
import { ITrainerProfileService } from "../../interfaces/trainer/trainer.profile-service.interface";

export default class TrainerProfileController {
  constructor(private _trainerProfileService: ITrainerProfileService) {}

  createProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        throw new Error("User not found");
      }

      const { experienceInYears, bio } = req.body;
      const certificateFile = req.file;

      if (!certificateFile) {
        throw new Error("Certificate file missing");
      }

      await this._trainerProfileService.createProfile(req.user.id, {
        experienceInYears: Number(experienceInYears),
        bio,
        certificateFile,
      });

      return res.status(201).json(TrainerProfileMapper.toResponse());
    } catch (err) {
      next(err);
    }
  };
}
