
import { Role } from "@/constants/roles";
import { AdminBaseUserResponseDto } from "./admin.dto";

export interface AdminGetUsersDto {
  page?: number;
  limit?: number;
  search?: string;
  role?: Exclude<Role, "admin">;
  isBlocked?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AdminGetUsersResponseDto
  extends AdminBaseUserResponseDto {}

export interface AdminBlockUnBlockUserDto {
  userId: string;
}
