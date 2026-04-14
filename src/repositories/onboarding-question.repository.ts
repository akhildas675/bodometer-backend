import { IOnboardingQuestionRepository } from "@/interfaces/admin/onboarding.question-repository.Interface";
import { OnboardingQuestionModel, IOnboardingQuestion } from "@/models/onboarding-question.model";
import { CreateQuestionDto } from "@/dto/admin/admin.dto";

export default class OnboardingQuestionRepository implements IOnboardingQuestionRepository {
  async createQuestion(data: CreateQuestionDto): Promise<IOnboardingQuestion> {
    const question = new OnboardingQuestionModel(data);
    return question.save();
  }
}
