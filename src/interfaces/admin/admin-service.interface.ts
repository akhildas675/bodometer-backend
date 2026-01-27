import { AddWorkoutDto, AddWorkoutResponseDto, AdminGetTrainersDto, AdminGetTrainersResponseDto, AdminGetUsersDto, AdminGetUsersResponseDto } from "../../dto/admin/admin.dto";
import { ApproveTrainerResponseDto, GetTrainerAppointmentsResponseDto, GetTrainerByIdResponseDto, RejectTrainerResponseDto } from "../../dto/trainer/trainer.dto";
import { Workout } from "./admin.interface";

export interface AdminServiceInterface {
  fetchUsers(query: AdminGetUsersDto): Promise<AdminGetUsersResponseDto[]>;
  blockUser(userId: string): Promise<void>;
  unblockUser(userId: string): Promise<void>;
  fetchTrainers(query: AdminGetTrainersDto): Promise<AdminGetTrainersResponseDto[]>;
  blockTrainer(trainerId: string): Promise<void>;
  unblockTrainer(trainerId: string): Promise<void>;
  // workouts

  workoutAdd(body:AddWorkoutDto):Promise<AddWorkoutResponseDto>
  fetchWorkouts(): Promise<Workout[]>;

  getTrainerAppointments(): Promise<GetTrainerAppointmentsResponseDto[]>;
  
 getTrainerByProfileId(profileId: string): Promise<GetTrainerByIdResponseDto>;
  
  approveTrainer(profileId: string): Promise<ApproveTrainerResponseDto>;
  
  rejectTrainer(profileId: string, reason: string): Promise<RejectTrainerResponseDto>;
}