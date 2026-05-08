import { AdminGetTrainersDto, AdminGetTrainersResponseDto, AdminGetUsersDto, AdminGetUsersResponseDto, CategoryQueryDto, CreateCategoryDto, GetCategoriesResponseDto, GetCategoryByIdResponseDto, GetTrainerAppointmentsQueryDto, PaginatedResponseDto, ToggleCategoryStatusResponseDto, UpdateCategoryDto } from "../../../dto/admin/admin.dto";
import { ApproveTrainerResponseDto, GetTrainerAppointmentsResponseDto, GetTrainerByIdResponseDto, RejectTrainerResponseDto } from "../../../dto/trainer/trainer.dto";
import { PaginatedResult } from "../../domain.interface/admin.interface/admin.interface";



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

  createCategory(data: CreateCategoryDto): Promise<void>;
  updateCategory(data: UpdateCategoryDto): Promise<void>;
  getCategoryById(categoryId: string): Promise<GetCategoryByIdResponseDto>;
  getAllCategories(query: CategoryQueryDto): Promise<GetCategoriesResponseDto>;
  toggleCategoryStatus(categoryId: string): Promise<ToggleCategoryStatusResponseDto>;
}