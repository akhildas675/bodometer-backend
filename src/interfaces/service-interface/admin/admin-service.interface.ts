import { AdminGetUsersDto, AdminGetUsersResponseDto } from "../../../dto/user/user.dto";
import { AdminGetTrainersDto, AdminGetTrainersResponseDto, GetTrainerAppointmentsQueryDto, GetTrainerByIdResponseDto, ApproveTrainerResponseDto, RejectTrainerResponseDto, GetTrainerAppointmentsResponseDto } from "../../../dto/trainer/trainer.dto";


import { PaginatedResponseDto } from "../../../dto/common.dto";
import { PaginatedResult } from "../../domain.interface/common.interface";
import { CreateTargetMuscleDto, GetAllTargetMusclesResponseDto, TargetMuscleDto, TargetMuscleQueryDto, ToggleTargetMuscleStatusResponseDto, UpdateTargetMuscleDto } from "../../../dto/target.muscles/target-muscles.dto";
import { CreateEquipmentDto, GetAllEquipmentResponseDto, EquipmentDto, EquipmentQueryDto, ToggleEquipmentStatusResponseDto, UpdateEquipmentDto } from "../../../dto/equipment/equipment.dto";
import { CreateExerciseDto, ExerciseDto, ExerciseQueryDto, GetAllExercisesResponseDto, ToggleExerciseStatusResponseDto, UpdateExerciseDto } from "../../../dto/exercise/exercise.dto";
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





  // Target Muscles
  createTargetMuscle(data: CreateTargetMuscleDto): Promise<void>;
  getAllTargetMuscles(query: TargetMuscleQueryDto): Promise<GetAllTargetMusclesResponseDto>;
  getTargetMuscleById(targetMuscleId: string): Promise<TargetMuscleDto>;
  updateTargetMuscle(targetMuscleId: string, data: UpdateTargetMuscleDto): Promise<void>;
  toggleTargetMuscleStatus(targetMuscleId: string): Promise<ToggleTargetMuscleStatusResponseDto>;

  // Equipment
  createEquipment(data: CreateEquipmentDto): Promise<void>;
  getAllEquipment(query: EquipmentQueryDto): Promise<GetAllEquipmentResponseDto>;
  getEquipmentById(equipmentId: string): Promise<EquipmentDto>;
  updateEquipment(equipmentId: string, data: UpdateEquipmentDto): Promise<void>;


  toggleEquipmentStatus(equipmentId: string): Promise<ToggleEquipmentStatusResponseDto>;

  // Exercises
  createExercise(data: CreateExerciseDto): Promise<void>;


  getAllExercises(query: ExerciseQueryDto): Promise<GetAllExercisesResponseDto>;
  getExerciseById(exerciseId: string): Promise<ExerciseDto>;
  updateExercise(exerciseId: string, data: UpdateExerciseDto): Promise<void>;


  toggleExerciseStatus(exerciseId: string): Promise<ToggleExerciseStatusResponseDto>;

  createMealCategory(data: MealCategoryDto): Promise<void>;
  getAllMealCategories(query: MealCategoryQueryDto): Promise<GetAllMealCategoriesResponseDto>;
  getMealCategoryById(mealCategoryId: string): Promise<MealCategoryDto>;
  updateMealCategory(mealCategoryId: string, data: UpdateMealCategoryDto): Promise<void>;
  toggleMealCategoryStatus(mealCategoryId: string): Promise<ToggleMealCategoryStatusResponseDto>;
}