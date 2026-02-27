import {
  AddWorkoutDto,
  AddWorkoutResponseDto,
 
} from "@/dto/admin/admin.dto";
import { Workout } from "./admin.interface";

export interface IAdminService {
  // workouts
  workoutAdd(body: AddWorkoutDto): Promise<AddWorkoutResponseDto>;
  fetchWorkouts(): Promise<Workout[]>;
}
