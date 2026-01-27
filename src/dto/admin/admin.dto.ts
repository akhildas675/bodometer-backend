import { Role } from "../../constants/identity.constants";

export interface AdminGetUsersDto {
  page?: number;
  limit?: number;
  search?: string;
  role?: Exclude<Role, "admin">;
  isBlocked?: boolean;
}

export interface AdminGetUsersResponseDto {
  id: string;
  name: string;
  email: string;
  role: Exclude<Role, "admin">;
  isBlocked: boolean;
  isVerified: boolean;
  createdAt: string;
  profilePic?: string | null;
}

export interface AdminBlockUnBlockDto {
  userId: string;
}

export interface AdminGetTrainersDto extends AdminGetUsersDto {}

export interface AdminGetTrainersResponseDto extends AdminGetUsersResponseDto {}

export interface AdminBlockUnblockTrainerDto {
  trainerId: string;
}

export interface AddWorkoutDto {
  workoutName: string;
  workoutDescription: string;
  file: Express.Multer.File;
}

export interface AddWorkoutResponseDto {
  id: string;
  workoutName: string;
  workoutDescription: string;
  workoutImage: string;
}

export interface GetWorkoutsResponseDto {
  id: string;
  workoutName: string;
  workoutDescription: string;
  workoutImage: string;
  isActive: boolean;
}
