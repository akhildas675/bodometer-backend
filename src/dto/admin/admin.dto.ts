import { Role } from "../../constants/roles";


export interface PaginationMetaDto {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponseDto<T> {
  data: T[];
  pagination: PaginationMetaDto;
}

export interface AdminBaseUserResponseDto {
  id: string;
  name: string;
  email: string;
  role: Exclude<Role, "admin">;
  isBlocked: boolean;
  isVerified: boolean;
  createdAt: string;
  profilePic?: string | null;
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
