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





//trainer

export interface AdminGetTrainersDto {
  page?: number;
  limit?: number;
  search?: string;
  isBlocked?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export type AdminGetTrainersResponseDto = AdminBaseUserResponseDto

export interface AdminBlockUnblockTrainerDto {
  trainerId: string;
}
export interface ApproveTrainerResponseDto {
  profileId: string;
  status: string;
}

export interface RejectTrainerBodyDto {
  reason: string;
}

export interface GetTrainerAppointmentsQueryDto {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  status?: string;
}


//user


export interface AdminGetUsersDto {
  page?: number;
  limit?: number;
  search?: string;
  role?: Exclude<Role, "admin">;
  isBlocked?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export type AdminGetUsersResponseDto = AdminBaseUserResponseDto

export interface AdminBlockUnBlockUserDto {
  userId: string;
}


