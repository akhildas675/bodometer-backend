import { Role } from "../../constants/roles";
import { PaginationMetaDto, PaginationQueryDto } from "../common.dto";
export { PaginationMetaDto, PaginatedResponseDto, PaginationQueryDto } from "../common.dto";

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

export interface AdminGetTrainersDto extends PaginationQueryDto {
  isBlocked?: boolean;
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

export interface GetTrainerAppointmentsQueryDto extends PaginationQueryDto {
  status?: string;
}


//user


export interface AdminGetUsersDto extends PaginationQueryDto {
  role?: Exclude<Role, "admin">;
  isBlocked?: boolean;
}

export type AdminGetUsersResponseDto = AdminBaseUserResponseDto

export interface AdminBlockUnBlockUserDto {
  userId: string;
}


export interface CreateCategoryDto {
  name: string;
  description: string;
  image?: Express.Multer.File;
}
export interface UpdateCategoryDto {
  categoryId: string;
  name?: string;
  description?: string;
  image?: Express.Multer.File;
}

export interface GetCategoryByIdResponseDto {
  categoryId: string;
  name: string;
  description: string;
  image: string;
  isActive: boolean;
}

export interface CategoryResponseDto {
  categoryId: string;
  name: string;
  description: string;
  image: string;
  isActive: boolean;
}

export interface CategoryQueryDto extends PaginationQueryDto {
  search?: string;
}

export interface GetCategoriesResponseDto {
  data: CategoryResponseDto[];
  pagination: PaginationMetaDto;
}

export interface ToggleCategoryStatusResponseDto {
  message: string;
  category: CategoryResponseDto;
}