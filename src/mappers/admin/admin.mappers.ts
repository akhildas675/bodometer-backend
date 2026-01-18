import { AdminGetUsersResponseDto } from "../../dto/admin/admin.dto";
import { AdminUserInterface } from "../../interfaces/admin/admin.interface";

export class AdminUserMapper{
    static toResponse(user:AdminUserInterface):AdminGetUsersResponseDto{
        return {
            id:user.id,
            name:user.name,
            email:user.email,
            role:user.role,
            isBlocked:user.isBlocked,
            isVerified:user.isVerified,
            createdAt:user.createdAt
        }
    }
    static toResponseList(users:AdminUserInterface[]):AdminGetUsersResponseDto[]{
        return users.map(this.toResponse)
    }
}