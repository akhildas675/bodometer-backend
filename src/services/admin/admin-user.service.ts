import { MESSAGES } from "../../constants/messages";
import { STATUS } from "../../constants/statuscode";
import { AdminGetUsersDto, AdminGetUsersResponseDto, PaginatedResponseDto } from "../../dto/admin/admin.dto";
import { IAdminUserRepository } from "../../interfaces/admin/admin.user-repository.interface";
import { IAdminUserService } from "../../interfaces/admin/admin.user-service.interface";
import { AdminAccountMapper } from "../../mappers/admin/admin.mappers";
import { AppError } from "../../utils/appError";

export class AdminUserService implements IAdminUserService {
    constructor(
        private _adminUserRepository: IAdminUserRepository,
    ) { }

    async fetchUsers(
        query: AdminGetUsersDto,
    ): Promise<PaginatedResponseDto<AdminGetUsersResponseDto>> {
        const { users, total } = await this._adminUserRepository.findUsers(query);

        const page = query.page || 1;
        const limit = query.limit || 10;
        const totalPages = Math.ceil(total / limit);

        return {
            data: AdminAccountMapper.toResponseList(users),
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },

        }
    }

    async blockUser(userId: string): Promise<void> {
        if (!userId) {
            throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
        }

        await this._adminUserRepository.updateUserStatus(userId, true);
    }

    async unblockUser(userId: string): Promise<void> {
        if (!userId) {
            throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
        }

        await this._adminUserRepository.updateUserStatus(userId, false);
    }

}