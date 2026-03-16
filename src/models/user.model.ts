import { GENDER, Gender } from "@/constants/identity.constants";
import { Role, ROLES } from "@/constants/roles";
import mongoose, { Document, Schema } from "mongoose";



export interface IUserDocument extends Document {
    name: string;
    userName: string;
    email: string;
    phoneNumber: string | null;
    password: string;
    profilePic?: string | null;
    gender: Gender,
    role: Role;
    isVerified: boolean;
    dateOfBirth?: Date | null;
    isBlocked: boolean;
    createdAt: Date;
    updatedAt: Date;

}



const UserSchema = new Schema<IUserDocument>(
    {
        name: {
            type: String,
            required: true,
        },
        userName: {
            type: String,
            required: false,
            sparse: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phoneNumber: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        profilePic: {
            type: String,
            default: null
        },
        gender: {
            type: String,
            enum: Object.values(GENDER),
            default: GENDER.PREFER_NOT_SAY
        },
        role: {
            type: String,
            enum: Object.values(ROLES),
            default: ROLES.USER,
        },
        isVerified: {
            type: Boolean,
            default: false
        },

        dateOfBirth: { type: Date, default: null },
        isBlocked: { type: Boolean, default: false }
    },

    { timestamps: true }
);

export const UserModel = mongoose.model<IUserDocument>
    ("User", UserSchema)