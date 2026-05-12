import { AdminGetTrainersDto, AdminGetTrainersResponseDto, AdminGetUsersDto, AdminGetUsersResponseDto, CategoryQueryDto, CreateCategoryDto, CreateSubscriptionFeatureDto, GetAllCategoriesResponseDto, GetAllSubscriptionFeaturesResponseDto, GetCategoryByIdResponseDto, GetTrainerAppointmentsQueryDto, PaginatedResponseDto, SubscriptionFeatureQueryDto, ToggleCategoryStatusResponseDto, ToggleSubscriptionFeatureStatusResponseDto, UpdateCategoryDto, UpdateSubscriptionFeatureDto, SubscriptionFeatureDto, CreateSubscriptionPlanDto, SubscriptionPlanQueryDto, GetAllSubscriptionPlansResponseDto, GetSubscriptionPlanByIdResponseDto, UpdateSubscriptionPlanDto, ToggleSubscriptionPlanStatusResponseDto } from "../../../dto/admin/admin.dto";
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

  createCategory(data: CreateCategoryDto): Promise<void>
  updateCategory(data: UpdateCategoryDto): Promise<void>
  getCategoryById(categoryId: string): Promise<GetCategoryByIdResponseDto>
  getAllCategories(query: CategoryQueryDto): Promise<GetAllCategoriesResponseDto>;
  toggleCategoryStatus(categoryId: string): Promise<ToggleCategoryStatusResponseDto>

  getAllSubscriptionFeatures(query: SubscriptionFeatureQueryDto): Promise<GetAllSubscriptionFeaturesResponseDto>;
  createSubscriptionFeature(data: CreateSubscriptionFeatureDto): Promise<void>
  updateSubscriptionFeature(data: UpdateSubscriptionFeatureDto): Promise<void>
  toggleSubscriptionFeatureStatus(subscriptionFeatureId: string): Promise<ToggleSubscriptionFeatureStatusResponseDto>
  getSubscriptionFeatureById(subscriptionFeatureId: string): Promise<SubscriptionFeatureDto>

  //subscription plan
  createSubscriptionPlan(data: CreateSubscriptionPlanDto): Promise<void>
  getAllSubscriptionPlans(query: SubscriptionPlanQueryDto): Promise<GetAllSubscriptionPlansResponseDto>;
  getSubscriptionPlanById(subscriptionPlanId: string): Promise<GetSubscriptionPlanByIdResponseDto>;
  updateSubscriptionPlan(data: UpdateSubscriptionPlanDto): Promise<void>;
  toggleSubscriptionPlanStatus(subscriptionPlanId: string): Promise<ToggleSubscriptionPlanStatusResponseDto>;




}