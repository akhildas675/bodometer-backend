import { Role, ROLES } from "../../../constants/roles";



export interface AdminAccountInterface<R extends Role> {
  id: string;
  name: string;
  email: string;
  role: R;
  isBlocked: boolean;
  isVerified: boolean;
  createdAt: string;
}

export type AdminUserInterface = AdminAccountInterface<typeof ROLES.USER>;
export type AdminTrainerInterface = AdminAccountInterface<typeof ROLES.TRAINER>;

export interface AdminUserActionDto {
  userId: string;
}


export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}


