import { Gender } from "@/constants/identity.constants";
import { IUserProfileDocument } from "@/models/user-profile.model";

export interface IUserProfile {
    userId: string;
    gender: Gender;
    dateOfBirth: Date | null;
}

export interface IUserProfileRepository {
    findByUserId(userId: string): Promise<IUserProfile | null>;
    createProfile(data: Partial<IUserProfile>): Promise<void>;
    updateProfile(userId: string, data: Partial<IUserProfile>): Promise<void>;
}
