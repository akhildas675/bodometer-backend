import { Gender } from "../../../constants/identity.constants";
import { Role } from "../../../constants/roles";
import { SubscriptionPlan } from "../admin.interface/admin.interface";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  userName: string;
  phoneNumber: string | null;
  gender: Gender;
  profilePic: string | null;
  dateOfBirth: Date | null;
}

export interface UpdateUserProfileInterface {
  name?: string;
  userName?: string;
  phoneNumber?: string | null;
  gender?: Gender;
  profilePic?: string;
  dateOfBirth?: Date;
}


export interface UserInterface {
  id: string;
  name: string;
  userName: string;
  email: string;
  phoneNumber?: string | null;
  password: string;
  profilePic?: string | null;
  role: Role;
  isVerified: boolean;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSubscriptions{
   subscriptionPlanId?: string;
  name: string;
  description: string;
  price: number;
  durationInDays: number;
  features: {
    featureId: string;
    limit?: number;
    limitType?: string;
  }[];
  isPopular: boolean;

  isActive?: boolean;
}