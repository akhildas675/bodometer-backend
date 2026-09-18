import { UserAnswerSubmission } from "../interface/onboarding.interface";
import { AnswerModel } from "../models/answer.model";
import { IAnswerRepository } from "../interface/repository.interface/answer-repository.interface";
import { injectable } from "inversify";

@injectable()
export default class AnswerRepository implements IAnswerRepository {
  async saveUserAnswers(data: UserAnswerSubmission): Promise<void> {
    await AnswerModel.findOneAndUpdate(
      { userId: data.userId },
      {
        $set: {
          answers: data.answers.map((ans) => ({
            questionId: ans.questionId,
            questionKey: ans.questionKey,
            answer: ans.answer,
          })),
          completed: data.completed ?? false,
          completedAt: data.completed ? new Date() : undefined,
        },
      },
      { upsert: true, new: true },
    );
  }

  async getUserAnswers(userId: string): Promise<UserAnswerSubmission | null> {
    const doc = await AnswerModel.findOne({
      userId,
    }).exec();
    if (!doc) return null;

    return {
      userId: doc.userId.toString(),
      answers: doc.answers.map((ans) => ({
        questionId: ans.questionId.toString(),
        questionKey: ans.questionKey,
        answer: ans.answer,
      })),
      completed: doc.completed,
      completedAt: doc.completedAt?.toISOString(),
    };
  }
}
