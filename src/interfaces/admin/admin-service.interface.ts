import { AddWorkoutDto, AdminGetTrainersDto, AdminGetTrainersResponseDto, AdminGetUsersDto, AdminGetUsersResponseDto, CreateSubscriptionDTO, GetTrainerAppointmentsQueryDto, OnboardingSectionResponseDto, PaginatedResponseDto, SubscriptionResponseDTO, UpdateSubscriptionDTO, UpdateWorkoutDto, WorkoutResponseDto } from "@/dto/admin/admin.dto";
import { ApproveTrainerResponseDto, GetTrainerAppointmentsResponseDto, GetTrainerByIdResponseDto, RejectTrainerResponseDto } from "@/dto/trainer/trainer.dto";
import { PaginatedResult, Workout } from "@/interfaces/admin/admin.interface";

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
  createWorkout(body: AddWorkoutDto): Promise<WorkoutResponseDto>;
  fetchWorkouts(): Promise<WorkoutResponseDto[]>;
  toggleWorkoutStatus(id: string): Promise<Workout>;
  getWorkoutById(id:string):Promise<WorkoutResponseDto>
  updateWorkout(id:string,data:UpdateWorkoutDto):Promise<WorkoutResponseDto>

  // Subscriptions
  createSubscription(data: CreateSubscriptionDTO): Promise<SubscriptionResponseDTO>;
  getAllSubscriptions(): Promise<SubscriptionResponseDTO[]>;
  getSubscriptionById(id: string): Promise<SubscriptionResponseDTO>;
  updateSubscription(id: string, data: UpdateSubscriptionDTO): Promise<SubscriptionResponseDTO>;
  toggleSubscriptionStatus(id: string): Promise<SubscriptionResponseDTO>;

  // Onboarding Sections
  getAllSections(): Promise<OnboardingSectionResponseDto[]>;
}