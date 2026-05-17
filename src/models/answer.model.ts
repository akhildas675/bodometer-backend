import mongoose, {
    Schema,
    Document
} from "mongoose";
import { OnboardingValue } from "@/interfaces/domain.interface/onboarding.interface";



export interface IAnswer
    extends Document {

    userId: mongoose.Types.ObjectId;

    answers: {
        questionId: mongoose.Types.ObjectId;

        questionKey?: string;

        answer: OnboardingValue;
    }[];

    completed: boolean;

    completedAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}



const AnswerSchema =
    new Schema<IAnswer>(
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
                unique: true,
                index: true
            },

            answers: [
                {
                    questionId: {
                        type: Schema.Types.ObjectId,
                        ref: "Question",
                        required: true
                    },

                    questionKey: {
                        type: String
                    },

                    answer: {
                        type: Schema.Types.Mixed,
                        required: true
                    }
                }
            ],

            completed: {
                type: Boolean,
                default: false
            },

            completedAt: {
                type: Date
            }
        },
        { timestamps: true }
    );



export const AnswerModel =
    mongoose.model<IAnswer>(
        "Answer",
        AnswerSchema
    );