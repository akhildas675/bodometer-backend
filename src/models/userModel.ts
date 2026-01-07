import mongoose, { Document, Schema } from "mongoose";
import { Gender, Role } from "../constants/identity.constants";


export interface IUserDocument extends Document {
    name: string;
    userName?:string;
    email: string;
    phoneNumber: string;
    password: string;
    profilePic?: string | null;
    gender?: Gender | null;
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
            sparse:true,
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
            enum: ["male", "female", "other", "prefer_not_say"],
            default: "prefer_not_say"
        },
        role: {
            type: String,
            enum: ["user", "trainer", "admin"],
            default: "user"
        },
        isVerified:{
            type:Boolean,
            default:false
        },
        
        dateOfBirth: { type: Date, default: null },
        isBlocked: { type: Boolean, default: false }
    },

    { timestamps: true }
);

export const UserModel = mongoose.model<IUserDocument>
    ("User", UserSchema)