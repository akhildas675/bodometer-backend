import { Workout } from "@/interfaces/admin/admin.interface";

export interface IWorkoutRepository {
  createWorkout(body: Workout): Promise<Workout>;
  toggleWorkoutStatus(id:string):Promise<Workout | null>
  getAllWorkouts(): Promise<Workout[]>;
  getWorkoutNameList(): Promise<Pick<Workout, "id" | "workoutName">[]>;
  findById(id: string): Promise<Workout | null>;
  getActiveWorkouts(
    page?: number,
    limit?: number,
    search?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
  ): Promise<{ workouts: Workout[]; total: number }>;
  getWorkoutById(id: string): Promise<Workout | null>;
getRelatedWorkouts(excludeId: string, limit?: number): Promise<Workout[]>;
updateWorkout(id: string, body: Partial<Workout>): Promise<Workout | null>;
}