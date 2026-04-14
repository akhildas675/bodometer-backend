import { IOnboardingQuestion } from "@/models/onboarding-question.model";
import { CreateQuestionDto } from "@/dto/admin/admin.dto";

export interface IOnboardingQuestionRepository {
  createQuestion(data: CreateQuestionDto): Promise<IOnboardingQuestion>;
}
