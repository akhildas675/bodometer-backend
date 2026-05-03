export interface PaginationMetaDto {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface PaginatedResponseDto<T> {
  data: T[];
  pagination: PaginationMetaDto;
}

export interface PaginationQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface BaseUserProfileDto {
  id: string;
  name: string;
  email: string;
  userName: string;
  phoneNumber: string | null;
  gender: string | null;
  profilePic: string | null;
  dateOfBirth: string | null;
}

export interface BaseUserDto extends BaseUserProfileDto {
  role: string;
  isVerified: boolean;
  isBlocked: boolean;
  createdAt?: string;
  updatedAt?: string;
}
