import { WorkoutListDto } from "../../dto/trainer/trainer.dto";
import { TrainerServiceInterface } from "../../interfaces/trainer/trainer-service.interface";
import { TrainerWorkoutList } from "../../interfaces/trainer/trainer.interface";
import TrainerRepository from "../../repositories/trainer/trainer.repository";

export class TrainerService implements TrainerServiceInterface {
    constructor(private trainerRepo: TrainerRepository) { }

    async fetchWorkoutList(): Promise<TrainerWorkoutList[]> {

        return this.trainerRepo.getWorkoutList();

    }
}