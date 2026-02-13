import { IBaseRepository } from "../base/base-repository.interface";
import {
  TrainerProfile,
  TrainerProfileDataInterface,
} from "./trainer.interface";
import { ITrainerProfileDocument } from "../../models/trainer-profile.model";

export interface ITrainerProfileRepository
  extends IBaseRepository<TrainerProfileDataInterface, ITrainerProfileDocument>
{
  findByUserId(userId: string): Promise<TrainerProfile | null>;
  createProfile(profile: TrainerProfileDataInterface): Promise<void>;
}