import { Workout } from "@/interfaces/admin/admin.interface";

export interface IWorkoutRepository {
  createWorkout(body: Workout): Promise<Workout>;
  getAllWorkouts(): Promise<Workout[]>;
  getWorkoutNameList(): Promise<Pick<Workout, "id" | "workoutName">[]>;
  findById(id: string): Promise<Workout | null>;
}