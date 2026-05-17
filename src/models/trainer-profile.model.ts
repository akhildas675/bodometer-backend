import mongoose, { Document, Schema } from "mongoose";
import { GENDER, Gender } from "../constants/identity.constants";
import { VERIFICATION_STATUS, VerificationStatus } from "../constants/verification.constants";


export interface ITrainerProfileDocument extends Document {
    userId: mongoose.Types.ObjectId;

    experienceInYears: number;
    coverPhoto:string,
    certifications: string[];
    bio: string;
    specializations: mongoose.Types.ObjectId[];
    gender: Gender;
    dateOfBirth: Date | null;
    verificationStatus: VerificationStatus;
    rejectionReason?: string | null;
    createdAt: Date;
    updatedAt: Date;
    applyCount:number;
}
const TrainerProfileSchema = new Schema<ITrainerProfileDocument>(
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

        experienceInYears: {
            type: Number,
            default: 0,
        },

        coverPhoto:{
            type:String,
            default:""
        },

        certifications: {
            type: [String],
            default: [],
        },

        bio: {
            type: String,
            default: "",
        },
        
        specializations: [
            {
                type: Schema.Types.ObjectId,
                ref: "Category",
            },
        ],

        verificationStatus: {
            type: String,
            enum: Object.values(VERIFICATION_STATUS),
            default: VERIFICATION_STATUS.PENDING,
        },

        rejectionReason: {
            type: String,
            default: null,
        },
        applyCount:{ 
            type: Number,
            default: 1 }
    },
    { timestamps: true }
);

export const TrainerProfileModel = mongoose.model<ITrainerProfileDocument>(
    "TrainerProfile",
    TrainerProfileSchema
);