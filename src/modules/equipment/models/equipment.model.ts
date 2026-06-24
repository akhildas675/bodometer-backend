import mongoose, { Document, Schema } from "mongoose";

export interface IEquipment extends Document {
    key: string;
    title: string;
    description: string;
    image: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const EquipmentSchema = new Schema<IEquipment>({
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

export const EquipmentModel = mongoose.model<IEquipment>("Equipment", EquipmentSchema);