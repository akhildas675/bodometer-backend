import { AddWorkoutDto, AddWorkoutResponseDto, AdminGetTrainersDto, AdminGetTrainersResponseDto, AdminGetUsersDto, AdminGetUsersResponseDto, CreateSubscriptionDTO, GetTrainerAppointmentsQueryDto, PaginatedResponseDto, SubscriptionResponseDTO, UpdateSubscriptionDTO } from "@/dto/admin/admin.dto";
import { ApproveTrainerResponseDto, GetTrainerAppointmentsResponseDto, GetTrainerByIdResponseDto, RejectTrainerResponseDto } from "@/dto/trainer/trainer.dto";
import { PaginatedResult } from "@/interfaces/admin/admin.interface";

export interface IAdminService {
  // Users
  fetchUsers(query: AdminGetUsersDto): Promise<PaginatedResponseDto<AdminGetUsersResponseDto>>;
  blockUser(userId: string): Promise<void>;
  unblockUser(userId: string): Promise<void>;

  // Trainers
  fetchTrainers(query: AdminGetTrainersDto): Promise<PaginatedResponseDto<AdminGetTrainersResponseDto>>;
  blockTrainer(trainerId: string): Promise<void>;
  unblockTrainer(trainerId: string): Promise<void>;
  getTrainerAppointments(query: GetTrainerAppointmentsQueryDto): Promise<PaginatedResult<GetTrainerAppointmentsResponseDto>>;
  getTrainerByProfileId(profileId: string): Promise<GetTrainerByIdResponseDto>;
  approveTrainer(profileId: string): Promise<ApproveTrainerResponseDto>;
  rejectTrainer(profileId: string, reason: string): Promise<RejectTrainerResponseDto>;

  // Workouts
  workoutAdd(body: AddWorkoutDto): Promise<AddWorkoutResponseDto>;
  fetchWorkouts(): Promise<AddWorkoutResponseDto[]>;

  // Subscriptions
  createSubscription(data: CreateSubscriptionDTO): Promise<SubscriptionResponseDTO>;
  getAllSubscriptions(): Promise<SubscriptionResponseDTO[]>;
  getSubscriptionById(id: string): Promise<SubscriptionResponseDTO>;
  updateSubscription(id: string, data: UpdateSubscriptionDTO): Promise<SubscriptionResponseDTO>;
  toggleSubscriptionStatus(id: string): Promise<SubscriptionResponseDTO>;
}