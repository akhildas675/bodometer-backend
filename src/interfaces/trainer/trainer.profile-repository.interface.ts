import { IBaseRepository } from "@/interfaces/base/base-repository.interface";
import {
  TrainerProfile,
  TrainerProfileDataInterface,
  TrainerStatusResponse,ReapplyTrainerData
} from "./trainer.interface";
import { ITrainerProfileDocument } from "@/models/trainer-profile.model";

export interface ITrainerProfileRepository
  extends IBaseRepository<TrainerProfileDataInterface, ITrainerProfileDocument>
{
  findByUserId(userId: string): Promise<TrainerProfile | null>;
  createProfile(profile: TrainerProfileDataInterface): Promise<void>;
  updateToReapply(userId: string, data: ReapplyTrainerData): Promise<void>;
  fetchTrainerStatus(userId:string):Promise<TrainerStatusResponse | null>
}