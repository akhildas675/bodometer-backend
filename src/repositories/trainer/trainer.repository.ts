import { ITrainerRepository } from "../../interfaces/trainer/trainer-repository.interface";
import { TrainerWorkoutList } from "../../interfaces/trainer/trainer.interface";
import { IWorkoutDocument, WorkoutModel } from "../../models/workout.model";
import { BaseRepository } from "../base/base.repository";

export default class TrainerRepository
  extends BaseRepository<TrainerWorkoutList, IWorkoutDocument>
  implements ITrainerRepository
{
  constructor() {
    super(WorkoutModel);
  }

  protected toInterface(doc: IWorkoutDocument): TrainerWorkoutList {
    return {
      id: doc._id.toString(),
      workoutName: doc.workoutName,
    };
  }

  async getWorkoutList(): Promise<TrainerWorkoutList[]> {
    return this.findAll();
  }
}