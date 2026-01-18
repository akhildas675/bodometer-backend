import { AdminGetUsersDto } from "../../dto/admin/admin.dto";
import { AdminUserInterface } from "./admin.interface";

export interface AdminRepositoryInterface{
    findUsers(query:AdminGetUsersDto):Promise<AdminUserInterface[]>;
    updateUserStatus(userId: string,isBlocked: boolean): Promise<void>;
}