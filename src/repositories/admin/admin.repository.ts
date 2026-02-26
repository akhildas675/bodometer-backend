
import { IAdminRepository } from "../../interfaces/admin/admin-repository.interface";
import {
  AdminUserInterface,
  Workout,
} from "../../interfaces/admin/admin.interface";

import { IUserDocument, UserModel } from "../../models/user.model";
import { IWorkoutDocument, WorkoutModel } from "../../models/workout.model";
import { BaseRepository } from "../base/base.repository";

export default class AdminRepository
  extends BaseRepository<AdminUserInterface, IUserDocument>
  implements IAdminRepository {
  protected toInterface(doc: IUserDocument): AdminUserInterface {
    throw new Error("Method not implemented.");
  }
  constructor() {
    super(UserModel);
  }


  
  // Workout management
  async createWorkout(body: Workout): Promise<Workout> {
    const doc = new WorkoutModel(body);
    const saved = await doc.save();
    return this.toWorkoutInterface(saved);
  }

  async getAllWorkouts(): Promise<Workout[]> {
    const docs = await WorkoutModel.find();
    return docs.map((doc) => this.toWorkoutInterface(doc));
  }

  private toWorkoutInterface(doc: IWorkoutDocument): Workout {
    return {
      id: doc._id.toString(),
      workoutName: doc.workoutName,
      workoutDescription: doc.workoutDescription,
      workoutImage: doc.workoutImage,
      isActive: doc.isActive,
    };
  }

 

 
}