import { AdminGetUsersDto, AdminGetUsersResponseDto } from "../../../dto/user/user.dto";
import { AdminGetTrainersDto, AdminGetTrainersResponseDto, GetTrainerAppointmentsQueryDto, GetTrainerByIdResponseDto, ApproveTrainerResponseDto, RejectTrainerResponseDto, GetTrainerAppointmentsResponseDto } from "../../../dto/trainer/trainer.dto";
import { CategoryQueryDto, CreateCategoryDto, UpdateCategoryDto, GetCategoryByIdResponseDto, GetAllCategoriesResponseDto, ToggleCategoryStatusResponseDto } from "../../../dto/category/category.dto";
import { SubscriptionFeatureQueryDto, GetAllSubscriptionFeaturesResponseDto, CreateSubscriptionFeatureDto, UpdateSubscriptionFeatureDto, ToggleSubscriptionFeatureStatusResponseDto, SubscriptionFeatureDto, CreateSubscriptionPlanDto, SubscriptionPlanQueryDto, GetAllSubscriptionPlansResponseDto, GetSubscriptionPlanByIdResponseDto, UpdateSubscriptionPlanDto, ToggleSubscriptionPlanStatusResponseDto, SubscriptionTransactionQueryDto, GetAllSubscriptionTransactionsResponseDto } from "../../../dto/subscription/subscription.dto";
import { CreateQuestionGroupDto, UpdateQuestionGroupDto, GetAllQuestionGroupsResponseDto, QuestionQueryDto, CreateQuestionDto, UpdateQuestionDto, GetAllQuestionsResponseDto, QuestionGroupResponseDto, OnboardingQuestionResponseDto } from "../../../dto/onboarding/onboarding.dto";
import { PaginatedResponseDto } from "../../../dto/common.dto";
import { PaginatedResult } from "../../domain.interface/common.interface";
import { QuestionGroupQuery } from "../../domain.interface/onboarding.interface";
import { CreateTargetMuscleDto, GetAllTargetMusclesResponseDto, TargetMuscleDto, TargetMuscleQueryDto, ToggleTargetMuscleStatusResponseDto, UpdateTargetMuscleDto } from "../../../dto/target.muscles/target-muscles.dto";
import { CreateEquipmentDto, GetAllEquipmentResponseDto, EquipmentDto, EquipmentQueryDto, ToggleEquipmentStatusResponseDto, UpdateEquipmentDto } from "../../../dto/equipment/equipment.dto";
import { CreateExerciseDto, ExerciseDto, ExerciseQueryDto, GetAllExercisesResponseDto, ToggleExerciseStatusResponseDto, UpdateExerciseDto } from "../../../dto/exercise/exercise.dto";



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

  // Question Groups
  createQuestionGroup(data: CreateQuestionGroupDto): Promise<void>;
  getAllQuestionGroups(query: QuestionGroupQuery): Promise<GetAllQuestionGroupsResponseDto>;
  getQuestionGroupById(groupId: string): Promise<QuestionGroupResponseDto>;
  updateQuestionGroup(groupId: string, data: UpdateQuestionGroupDto): Promise<void>;
  toggleQuestionGroupStatus(groupId: string): Promise<void>;

  // Questions
  createQuestion(data: CreateQuestionDto, adminId: string): Promise<void>;
  getAllQuestions(query: QuestionQueryDto): Promise<GetAllQuestionsResponseDto>;
  getQuestionById(questionId: string): Promise<OnboardingQuestionResponseDto>;
  updateQuestion(questionId: string, data: UpdateQuestionDto): Promise<void>;
  toggleQuestionStatus(questionId: string): Promise<void>;

  // Subscription Transactions
  getAllSubscriptionTransactions(query: SubscriptionTransactionQueryDto): Promise<GetAllSubscriptionTransactionsResponseDto>;

  // Data Sources
  getQuestionDataSources(): Promise<{ label: string; value: string }[]>;

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

}