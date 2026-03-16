import { Workout } from "@/interfaces/admin/admin.interface";
import { TrainerWorkoutList } from "@/interfaces/trainer/trainer.interface";
import { IWorkoutRepository } from "@/interfaces/workout/workout-repository.interface";
import { IWorkoutDocument, WorkoutModel } from "@/models/workout.model";
import { BaseRepository } from "@/repositories/base/base.repository";

export default class WorkoutRepository
  extends BaseRepository<Workout, IWorkoutDocument>
  implements IWorkoutRepository
{
  constructor() {
    super(WorkoutModel);
  }

  protected toInterface(doc: IWorkoutDocument): Workout {
    return {
      id: doc._id.toString(),
      workoutName: doc.workoutName,
      workoutDescription: doc.workoutDescription,
      workoutImage: doc.workoutImage,
      isActive: doc.isActive,
    };
  }

  async createWorkout(body: Workout): Promise<Workout> {
    return this.create(body);
  }

  async getAllWorkouts(): Promise<Workout[]> {
    return this.findAll({});
  }

  async getWorkoutNameList(): Promise<TrainerWorkoutList[]> {
  const docs = await WorkoutModel.find().select("_id workoutName").exec();
  return docs.map((doc) => ({
    id: doc._id.toString(),      
    workoutName: doc.workoutName,
  }));
}
}