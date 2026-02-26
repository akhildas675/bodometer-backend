
import { AdminGetUsersDto, AdminGetUsersResponseDto, PaginatedResponseDto } from "../../dto/admin/admin.dto";

export interface IAdminUserService {
    fetchUsers(query: AdminGetUsersDto): Promise<PaginatedResponseDto<AdminGetUsersResponseDto>>;
    blockUser(userId: string): Promise<void>;
    unblockUser(userId: string): Promise<void>;
}