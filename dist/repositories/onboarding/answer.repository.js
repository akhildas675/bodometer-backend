"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const answer_model_1 = require("../../models/answer.model");
const mongoose_1 = __importDefault(require("mongoose"));
class AnswerRepository {
    async saveUserAnswers(data) {
        await answer_model_1.AnswerModel.findOneAndUpdate({ userId: new mongoose_1.default.Types.ObjectId(data.userId) }, {
            $set: {
                answers: data.answers.map((ans) => ({
                    questionId: new mongoose_1.default.Types.ObjectId(ans.questionId),
                    questionKey: ans.questionKey,
                    answer: ans.answer,
                })),
                completed: data.completed ?? false,
                completedAt: data.completed ? new Date() : undefined,
            },
        }, { upsert: true, new: true });
    }
    async getUserAnswers(userId) {
        const doc = await answer_model_1.AnswerModel.findOne({
            userId: new mongoose_1.default.Types.ObjectId(userId),
        }).exec();
        if (!doc)
            return null;
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
exports.default = AnswerRepository;
