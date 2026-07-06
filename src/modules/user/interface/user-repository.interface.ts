import { PaginationMeta, PaginatedResult } from "@/modules/base/interface/common.interface";
import {
  UpdateUserProfileInterface,
  UserInterface,
} from "@/modules/user/interface/user.interface";

export interface IUserRepository {
  // Base
  findById(id: string): Promise<UserInterface | null>;
  create(data: Partial<UserInterface>): Promise<UserInterface>;

  // Auth
  findByEmail(email: string): Promise<UserInterface | null>;
  findByUsername(username: string): Promise<UserInterface | null>;
  updatePassword(userId: string, password: string): Promise<void>;
  updateVerified(userId: string, isVerified: boolean): Promise<void>;

  // Profile
  updateProfile(
    userId: string,
    updateData: UpdateUserProfileInterface,
  ): Promise<UserInterface | null>;

  //  Admin
  findByRolePaginated(
    role: string,
    search?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
    page?: number,
    limit?: number,
  ): Promise<{ data: UserInterface[]; pagination: PaginationMeta }>;
  updateBlockStatus(userId: string, isBlocked: boolean): Promise<void>;
}
