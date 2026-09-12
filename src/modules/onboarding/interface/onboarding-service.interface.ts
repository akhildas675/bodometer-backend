import {
  CreateQuestionGroupDto,
  GetAllQuestionGroupsResponseDto,
  QuestionGroupResponseDto,
  UpdateQuestionGroupDto,
  CreateQuestionDto,
  GetAllQuestionsResponseDto,
  OnboardingQuestionResponseDto,
  UpdateQuestionDto,
  QuestionQueryDto,
} from "../dto/onboarding.dto";
import {
  UserAnswerSubmission,
  OnboardingValue,
} from "./onboarding.interface";

export interface IOnboardingService {
  // Admin Methods
  createQuestionGroup(data: CreateQuestionGroupDto): Promise<void>;
  getAllQuestionGroups(query: QuestionQueryDto): Promise<GetAllQuestionGroupsResponseDto>;
  getQuestionGroupById(groupId: string): Promise<QuestionGroupResponseDto>;
  updateQuestionGroup(groupId: string, data: UpdateQuestionGroupDto): Promise<void>;
  toggleQuestionGroupStatus(groupId: string): Promise<void>;
  createQuestion(data: CreateQuestionDto, adminId: string): Promise<void>;
  getAllQuestions(query: QuestionQueryDto): Promise<GetAllQuestionsResponseDto>;
  getQuestionById(questionId: string): Promise<OnboardingQuestionResponseDto>;
  updateQuestion(questionId: string, data: UpdateQuestionDto): Promise<void>;
  toggleQuestionStatus(questionId: string): Promise<void>;
  getQuestionDataSources(): Promise<{ label: string; value: string }[]>;

  // User Methods
  submitOnboarding(
    userId: string,
    data: {
      answers: { questionId: string; key: string; value: OnboardingValue }[];
    },
  ): Promise<void>;
  getOnboardingStatus(userId: string): Promise<{ completed: boolean }>;
  getOnboardingAnswers(userId: string): Promise<UserAnswerSubmission | null>;
}
