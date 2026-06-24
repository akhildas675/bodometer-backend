import { AdminGetUsersDto, AdminGetUsersResponseDto } from "../../../dto/user/user.dto";
import { AdminGetTrainersDto, AdminGetTrainersResponseDto, GetTrainerAppointmentsQueryDto, GetTrainerByIdResponseDto, ApproveTrainerResponseDto, RejectTrainerResponseDto, GetTrainerAppointmentsResponseDto } from "../../../dto/trainer/trainer.dto";


import { PaginatedResponseDto } from "../../../dto/common.dto";
import { PaginatedResult } from "../../domain.interface/common.interface";

import { 
  MealCategoryDto, 
  UpdateMealCategoryDto, 
  MealCategoryQueryDto, 
  GetAllMealCategoriesResponseDto, 
  ToggleMealCategoryStatusResponseDto 
} from "@/dto/meal.category/meal-category.dto";



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







  createMealCategory(data: MealCategoryDto): Promise<void>;
  getAllMealCategories(query: MealCategoryQueryDto): Promise<GetAllMealCategoriesResponseDto>;
  getMealCategoryById(mealCategoryId: string): Promise<MealCategoryDto>;
  updateMealCategory(mealCategoryId: string, data: UpdateMealCategoryDto): Promise<void>;
  toggleMealCategoryStatus(mealCategoryId: string): Promise<ToggleMealCategoryStatusResponseDto>;
}