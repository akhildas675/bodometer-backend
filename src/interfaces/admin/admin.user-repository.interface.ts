
import { AdminGetUsersDto } from "@/dto/admin/admin-user.dto";
import { AdminUserInterface } from "./admin.interface";

export interface IAdminUserRepository{
     findUsers(query: AdminGetUsersDto): Promise<{users:AdminUserInterface[];total:number}>;
      updateUserStatus(userId: string, isBlocked: boolean): Promise<void>;
}