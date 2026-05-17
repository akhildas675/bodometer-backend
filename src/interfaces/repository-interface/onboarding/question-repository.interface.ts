import {
  OnboardingQuestion,
  QuestionQuery,
  GetAllQuestionsResponse,
} from "@/interfaces/domain.interface/onboarding.interface";

export interface IQuestionRepository {
  createQuestion(data: OnboardingQuestion): Promise<void>;
  getQuestionById(questionId: string): Promise<OnboardingQuestion | null>;
  updateQuestion(
    questionId: string,
    data: Partial<OnboardingQuestion>,
  ): Promise<void>;
  getAllQuestions(query: QuestionQuery): Promise<GetAllQuestionsResponse>;
  toggleQuestionStatus(questionId: string): Promise<OnboardingQuestion | null>;
  getQuestionsByGroup(
    groupId: string,
    activeOnly?: boolean,
  ): Promise<OnboardingQuestion[]>;
}
