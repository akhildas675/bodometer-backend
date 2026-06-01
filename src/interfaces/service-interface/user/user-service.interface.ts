import { CategoryQuery, GetAllCategoriesResponse } from "../../../interfaces/domain.interface/category.interface";
import { GetAllQuestionGroupsResponse, GetAllQuestionsResponse, OnboardingValue, UserAnswerSubmission } from "../../../interfaces/domain.interface/onboarding.interface";
import { ChangePasswordDto, FindUserResponseDto, UpdateBmiDto, UpdateBmiResponseDto, UpdateUserProfileDto } from "../../../dto/user/user.dto";
import { ActiveSubscriptionDto, UserSubscriptionPlanResponseDto, SubscriptionTransactionDto, SubscriptionTransactionQueryDto } from "../../../dto/subscription/subscription.dto";
import { GetTrainersQueryDto, TrainerDetailDto, TrainerListResponseDto } from "../../../dto/trainer/trainer.dto";
import { CategoryDetailDto } from "../../../dto/category/category.dto";
import { PaginationMeta } from "../../../interfaces/domain.interface/common.interface";
import { Exercise } from "../../../interfaces/domain.interface/exercise.interface";
import { PaginatedResult } from "../../../interfaces/domain.interface/common.interface";
import { ExerciseQueryDto, GetAllExercisesResponseDto, ExerciseDto, WorkoutPlanDetailDto, WorkoutPlanResponseDto } from "../../../dto/exercise/exercise.dto";
import { EquipmentQueryDto, GetAllEquipmentResponseDto } from "../../../dto/equipment/equipment.dto";

import { WorkoutExerciseStatus } from "../../../constants/fitness.constant";
export interface IUserService {
  fetchUser(userId: string): Promise<FindUserResponseDto>;
  updateProfile(userId: string, updateData: UpdateUserProfileDto): Promise<FindUserResponseDto>;
  uploadProfilePicture(userId: string, file: Express.Multer.File): Promise<string>;
  changePassword(userId: string, dto: ChangePasswordDto): Promise<void>;
  getTrainers(query: GetTrainersQueryDto): Promise<TrainerListResponseDto>;
  getTrainerById(id: string): Promise<TrainerDetailDto>;
  getCategories(query: CategoryQuery): Promise<GetAllCategoriesResponse>;
  getAllEquipment(query: EquipmentQueryDto): Promise<GetAllEquipmentResponseDto>;
  getCategoryById(id: string): Promise<CategoryDetailDto>;
  getMySubscriptions(): Promise<UserSubscriptionPlanResponseDto[] | null>
  createCheckoutSession(userId: string, planId: string): Promise<{ checkoutUrl: string }>;
  verifyPaymentAndSave(userId: string, sessionId: string): Promise<ActiveSubscriptionDto>;
  getActiveSubscription(userId: string): Promise<ActiveSubscriptionDto | null>;
  getOnboardingGroups(): Promise<GetAllQuestionGroupsResponse>;
  getOnboardingQuestions(): Promise<GetAllQuestionsResponse>;
  submitOnboarding(userId: string, data: { answers: { questionId: string; key: string; value: OnboardingValue }[] }): Promise<void>;
  getOnboardingStatus(userId: string): Promise<{ completed: boolean }>;
  getOnboardingAnswers(userId: string): Promise<UserAnswerSubmission | null>;
  getUserTransactions(
    userId: string,
    query: SubscriptionTransactionQueryDto,
  ): Promise<{ data: SubscriptionTransactionDto[]; pagination: PaginationMeta }>;
  calculateBmi: (data: UpdateBmiDto) => Promise<UpdateBmiResponseDto>;
  getExercises(query: ExerciseQueryDto): Promise<GetAllExercisesResponseDto>;
  getExerciseById(id: string): Promise<ExerciseDto>;
  generateWorkout(userId: string): Promise<WorkoutPlanDetailDto>;
  getWorkoutPlan(userId: string): Promise<WorkoutPlanResponseDto | null>;
  getWorkoutPlans(userId: string): Promise<WorkoutPlanResponseDto[]>;
  markDayCompleted(userId: string, planId: string, dayNumber: number, completed: boolean): Promise<WorkoutPlanResponseDto>;
  markExerciseStatus(userId: string, planId: string, dayNumber: number, exerciseId: string, status: WorkoutExerciseStatus): Promise<WorkoutPlanResponseDto>;
}