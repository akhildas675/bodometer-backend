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
  fetchUsers(query: AdminGetUsersDto): Promise<PaginatedResponseDto<AdminGetUsersResponseDto>>;
  blockUser(userId: string): Promise<void>;
  unblockUser(userId: string): Promise<void>;
  fetchTrainers(
    query: AdminGetTrainersDto
  ): Promise<PaginatedResponseDto<AdminGetTrainersResponseDto>>;
  blockTrainer(trainerId: string): Promise<void>;
  unblockTrainer(trainerId: string): Promise<void>;
  // workouts
  workoutAdd(body: AddWorkoutDto): Promise<AddWorkoutResponseDto>;
  fetchWorkouts(): Promise<Workout[]>;
  getTrainerAppointments(
  search?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  page?: number,
  limit?: number,
  status?: string
): Promise<PaginatedResult<GetTrainerAppointmentsResponseDto>>;
  getTrainerByProfileId(profileId: string): Promise<GetTrainerByIdResponseDto>;
  approveTrainer(profileId: string): Promise<ApproveTrainerResponseDto>;
  rejectTrainer(
    profileId: string,
    reason: string,
  ): Promise<RejectTrainerResponseDto>;
}
