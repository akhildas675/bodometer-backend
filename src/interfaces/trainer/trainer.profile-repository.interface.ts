import { TrainerProfile, TrainerProfileDataInterface } from "./trainer.interface";



export interface ITrainerProfileRepository {
  findByUserId(userId: string): Promise<TrainerProfile | null>;
  create(profile: TrainerProfileDataInterface): Promise<void>;
}
