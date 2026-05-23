import { BODY_REGION, BodyRegion } from "@/constants/fitness.constant";
import mongoose, { Document, Schema } from "mongoose";

export interface ITargetMuscle extends Document {
    key: string;
    title: string;
    description: string;
    image: string;
    bodyRegion: BodyRegion
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}


const TargetMuscleSchema = new Schema<ITargetMuscle>({
    key: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: String,
        required: true,
        trim: true,
    },
    bodyRegion: {
        type: String,
        required: true,
        enum: Object.values(BODY_REGION),
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
})

export const TargetMuscleModel = mongoose.model<ITargetMuscle>("TargetMuscle", TargetMuscleSchema);