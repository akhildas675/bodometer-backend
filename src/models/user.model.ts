
import mongoose, { Document, Schema } from "mongoose";
import { GENDER, Gender } from "../constants/identity.constants";
import { Role, ROLES } from "../constants/roles";



export interface IUserDocument extends Document {
    name: string;
    userName: string;
    email: string;
    phoneNumber: string | null;
    password: string;
    profilePic?: string | null;
    role: Role;
    isVerified: boolean;
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
        role: {
            type: String,
            enum: Object.values(ROLES),
            default: ROLES.USER,
        },
        isVerified: {
            type: Boolean,
            default: false
        },

        isBlocked: { type: Boolean, default: false }
    },

    { timestamps: true }
);

export const UserModel = mongoose.model<IUserDocument>
    ("User", UserSchema)