import { AdminGetUsersDto, AdminGetUsersResponseDto } from "@/dto/admin/admin-user.dto";
import { PaginatedResponseDto } from "@/dto/admin/admin.dto";


export interface IAdminUserService {
    fetchUsers(query: AdminGetUsersDto): Promise<PaginatedResponseDto<AdminGetUsersResponseDto>>;
    blockUser(userId: string): Promise<void>;
    unblockUser(userId: string): Promise<void>;
}