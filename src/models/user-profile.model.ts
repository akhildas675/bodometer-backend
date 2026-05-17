import mongoose, { Document, Schema } from "mongoose";
import { GENDER, Gender } from "../constants/identity.constants";

export interface IUserProfileDocument extends Document {
    userId: mongoose.Types.ObjectId;
    gender: Gender;
    dateOfBirth: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfileDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        gender: {
            type: String,
            enum: Object.values(GENDER),
            default: GENDER.PREFER_NOT_SAY
        },
        dateOfBirth: { 
            type: Date, 
            default: null 
        },
    },
    { timestamps: true }
);

export const UserProfileModel = mongoose.model<IUserProfileDocument>(
    "UserProfile",
    UserProfileSchema
);
