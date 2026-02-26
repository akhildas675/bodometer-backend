import {
  AddWorkoutDto,
  AddWorkoutResponseDto,
  AdminGetTrainersDto,
  AdminGetTrainersResponseDto,
  AdminGetUsersDto,
  AdminGetUsersResponseDto,
  PaginatedResponseDto,
} from "../../dto/admin/admin.dto";
import {
  ApproveTrainerResponseDto,
  GetTrainerAppointmentsResponseDto,
  GetTrainerByIdResponseDto,
  RejectTrainerResponseDto,
} from "../../dto/trainer/trainer.dto";
import { PaginatedResult, Workout } from "./admin.interface";

export interface IAdminService {
  // workouts
  workoutAdd(body: AddWorkoutDto): Promise<AddWorkoutResponseDto>;
  fetchWorkouts(): Promise<Workout[]>;
}
