import { Workout } from "@/interfaces/admin/admin.interface";
import { TrainerWorkoutList } from "@/interfaces/trainer/trainer.interface";
import { IWorkoutRepository } from "@/interfaces/workout/workout-repository.interface";
import { IWorkoutDocument, WorkoutModel } from "@/models/workout.model";
import { BaseRepository } from "@/repositories/base/base.repository";
import mongoose from "mongoose";

export default class WorkoutRepository
  extends BaseRepository<Workout, IWorkoutDocument>
  implements IWorkoutRepository {
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
  async getActiveWorkouts(
    page?: number,
    limit?: number,
    search?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
  ): Promise<{ workouts: Workout[]; total: number }> {
    const filter: Record<string, unknown> = { isActive: true };
    if (search) filter.workoutName = { $regex: search, $options: "i" };

    const total = await WorkoutModel.countDocuments(filter);

    const sort: Record<string, 1 | -1> = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    const query = WorkoutModel.find(filter).sort(sort);
    if (page && limit) {
      query.skip((page - 1) * limit).limit(limit);
    }

    const docs = await query.exec();
    return {
      workouts: docs.map((doc) => this.toInterface(doc)),
      total,
    };
  }

  async getWorkoutById(id: string): Promise<Workout | null> {
    const doc = await WorkoutModel.findById(id);
    if (!doc) return null;
    return this.toInterface(doc);
  }

  async getRelatedWorkouts(excludeId: string, limit = 3): Promise<Workout[]> {
    const docs = await WorkoutModel.aggregate([
      { $match: { isActive: true, _id: { $ne: new mongoose.Types.ObjectId(excludeId) } } },
      { $sample: { size: limit } },
    ]);
    return docs.map((doc) => ({
      id: doc._id.toString(),
      workoutName: doc.workoutName,
      workoutDescription: doc.workoutDescription,
      workoutImage: doc.workoutImage,
      isActive: doc.isActive,
    }));
  }

}