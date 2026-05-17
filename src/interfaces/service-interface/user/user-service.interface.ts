import { CategoryQuery, GetAllCategoriesResponse } from "../../../interfaces/domain.interface/category.interface";
import { GetAllQuestionGroupsResponse, GetAllQuestionsResponse, OnboardingValue, UserAnswerSubmission } from "../../../interfaces/domain.interface/onboarding.interface";
import { ChangePasswordDto, FindUserResponseDto, UpdateUserProfileDto } from "../../../dto/user/user.dto";
import { ActiveSubscriptionDto, UserSubscriptionPlanResponseDto } from "../../../dto/subscription/subscription.dto";
import { GetTrainersQueryDto, TrainerDetailDto, TrainerListResponseDto } from "../../../dto/trainer/trainer.dto";
import { CategoryDetailDto } from "../../../dto/category/category.dto";



export interface IUserService {
  fetchUser(userId: string): Promise<FindUserResponseDto>;
  updateProfile(userId: string, updateData: UpdateUserProfileDto): Promise<FindUserResponseDto>;
  uploadProfilePicture(userId: string, file: Express.Multer.File): Promise<string>;
  changePassword(userId: string, dto: ChangePasswordDto): Promise<void>;
  getTrainers(query: GetTrainersQueryDto): Promise<TrainerListResponseDto>;
  getTrainerById(id: string): Promise<TrainerDetailDto>;
  getCategories(query: CategoryQuery): Promise<GetAllCategoriesResponse>;
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
}