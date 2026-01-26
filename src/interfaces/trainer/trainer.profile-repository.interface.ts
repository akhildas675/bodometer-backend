import { TrainerProfile } from "./trainer.interface";

export interface TrainerProfileRepositoryInterface {
  findByUserId(userId: string): Promise<TrainerProfile | null>;
}