import { ITrainerRepository } from "../../interfaces/trainer/trainer-repository.interface";
import { ITrainerService } from "../../interfaces/trainer/trainer-service.interface";
import { TrainerWorkoutList } from "../../interfaces/trainer/trainer.interface";

export class TrainerService implements ITrainerService {
  constructor(private trainerRepo: ITrainerRepository) {}

  async fetchWorkoutList(): Promise<TrainerWorkoutList[]> {
    return this.trainerRepo.getWorkoutList();
  }
}
