import { AdminGetUsersDto, AdminGetUsersResponseDto } from "../../dto/admin/admin.dto";

export interface AdminServiceInterface{
    fetchUsers(query:AdminGetUsersDto):Promise<AdminGetUsersResponseDto[]>;
    blockUser(userId: string): Promise<void>;
    unblockUser(userId: string): Promise<void>;
}