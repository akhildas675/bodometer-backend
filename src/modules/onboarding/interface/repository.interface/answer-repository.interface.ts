import { UserAnswerSubmission } from "../onboarding.interface";

export interface IAnswerRepository {
  saveUserAnswers(data: UserAnswerSubmission): Promise<void>;
  getUserAnswers(userId: string): Promise<UserAnswerSubmission | null>;
}
