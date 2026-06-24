
import { GetAllQuestionGroupsResponse, GetAllQuestionsResponse, OnboardingValue, UserAnswerSubmission } from "../../../interfaces/domain.interface/onboarding.interface";
import { ChangePasswordDto, FindUserResponseDto, UpdateBmiDto, UpdateBmiResponseDto, UpdateUserProfileDto } from "../../../dto/user/user.dto";

import { GetTrainersQueryDto, TrainerDetailDto, TrainerListResponseDto } from "../../../dto/trainer/trainer.dto";
import { PaginationMeta } from "../../../interfaces/domain.interface/common.interface";

import { ExerciseQueryDto, GetAllExercisesResponseDto, ExerciseDto } from "../../../dto/exercise/exercise.dto";
import { WorkoutPlanDetailDto, WorkoutPlanResponseDto, GetWorkoutPlansResponseDto, WorkoutProgressResponseDto, MarkDayCompletedDto, MarkExerciseStatusDto } from "../../../dto/workout/workout-plan.dto";
import { EquipmentQueryDto, GetAllEquipmentResponseDto } from "../../../dto/equipment/equipment.dto";
import { MealCategoryQueryDto, GetAllMealCategoriesResponseDto } from "../../../dto/meal.category/meal-category.dto";
import { CreateBookingDto, GetBookingsQueryDto, GetSlotsQueryDto, DynamicSlotDto } from "../../../dto/trainer/trainer-booking.dto";
import { PopulatedTrainerBooking } from "../../../interfaces/domain.interface/trainer-booking.interface";
import { Timeframe } from "@/constants/fitness.constant";


export interface IUserService {
  fetchUser(userId: string): Promise<FindUserResponseDto>;
  updateProfile(userId: string, updateData: UpdateUserProfileDto): Promise<FindUserResponseDto>;
  uploadProfilePicture(userId: string, file: Express.Multer.File): Promise<string>;
  changePassword(userId: string, dto: ChangePasswordDto): Promise<void>;
  getTrainers(query: GetTrainersQueryDto): Promise<TrainerListResponseDto>;
  getTrainerById(id: string): Promise<TrainerDetailDto>;
 
  getAllEquipment(query: EquipmentQueryDto): Promise<GetAllEquipmentResponseDto>;
  getMealCategories(query: MealCategoryQueryDto): Promise<GetAllMealCategoriesResponseDto>;
 

  getOnboardingGroups(): Promise<GetAllQuestionGroupsResponse>;
  getOnboardingQuestions(): Promise<GetAllQuestionsResponse>;
  submitOnboarding(userId: string, data: { answers: { questionId: string; key: string; value: OnboardingValue }[] }): Promise<void>;
  getOnboardingStatus(userId: string): Promise<{ completed: boolean }>;
  getOnboardingAnswers(userId: string): Promise<UserAnswerSubmission | null>;

  calculateBmi: (data: UpdateBmiDto) => Promise<UpdateBmiResponseDto>;
  getExercises(query: ExerciseQueryDto): Promise<GetAllExercisesResponseDto>;
  getExerciseById(id: string): Promise<ExerciseDto>;
  generateWorkout(userId: string): Promise<WorkoutPlanDetailDto>;
  getWorkoutPlans(userId: string): Promise<GetWorkoutPlansResponseDto>;
  markDayCompleted(data: MarkDayCompletedDto): Promise<WorkoutPlanResponseDto>;
  markExerciseStatus(data: MarkExerciseStatusDto): Promise<WorkoutPlanResponseDto>;
  getWorkoutProgress(userId: string, timeframe?: Timeframe): Promise<WorkoutProgressResponseDto>;
  
  // Trainer Booking Methods
  getAvailableSlots(trainerId: string, query: GetSlotsQueryDto): Promise<DynamicSlotDto[]>;
  createBooking(userId: string, data: CreateBookingDto): Promise<PopulatedTrainerBooking>;
  getUserBookings(userId: string, query: GetBookingsQueryDto): Promise<{ data: PopulatedTrainerBooking[]; pagination: PaginationMeta }>;
  cancelBookingByUser(userId: string, bookingId: string, reason?: string): Promise<PopulatedTrainerBooking>;
}