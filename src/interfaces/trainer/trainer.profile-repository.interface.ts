import { TrainerProfile, TrainerProfileDataInterface } from "./trainer.interface";



export interface TrainerProfileRepositoryInterface {
  findByUserId(userId: string): Promise<TrainerProfile | null>;
  create(profile: TrainerProfileDataInterface): Promise<void>;
}
