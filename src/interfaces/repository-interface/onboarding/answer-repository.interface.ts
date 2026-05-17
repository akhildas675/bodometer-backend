import { UserAnswerSubmission } from "@/interfaces/domain.interface/admin.interface/admin.interface";

export interface IAnswerRepository {
  saveUserAnswers(data: UserAnswerSubmission): Promise<void>;
  getUserAnswers(userId: string): Promise<UserAnswerSubmission | null>;
}
