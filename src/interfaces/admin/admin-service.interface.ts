import {
  AddWorkoutDto,
  AddWorkoutResponseDto,
  CreateSubscriptionDTO,
  SubscriptionResponseDTO,
  UpdateSubscriptionDTO,
 
} from "@/dto/admin/admin.dto";
import { Workout } from "./admin.interface";

export interface IAdminService {
  // workouts
  workoutAdd(body: AddWorkoutDto): Promise<AddWorkoutResponseDto>;
  fetchWorkouts(): Promise<Workout[]>;


  createSubscription(data: CreateSubscriptionDTO): Promise<SubscriptionResponseDTO>;
  getAllSubscriptions(): Promise<SubscriptionResponseDTO[]>;
  getSubscriptionById(id: string): Promise<SubscriptionResponseDTO>;
  updateSubscription(id: string, data: UpdateSubscriptionDTO): Promise<SubscriptionResponseDTO>;
  toggleSubscriptionStatus(id: string): Promise<SubscriptionResponseDTO>;
  
}
