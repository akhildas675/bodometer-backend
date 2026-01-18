import { STATUS } from "../../constants/statuscode";
import { AdminGetUsersDto, AdminGetUsersResponseDto } from "../../dto/admin/admin.dto";
import { AdminServiceInterface } from "../../interfaces/admin/admin-service.interface";
import { AdminUserMapper } from "../../mappers/admin/admin.mappers";
import AdminRepository from "../../repositories/admin/admin.repository";
import { AppError } from "../../utils/appError";


export class AdminService implements AdminServiceInterface {
  constructor(
    private adminRepo: AdminRepository
  ) {}

  async fetchUsers(
    query: AdminGetUsersDto
  ): Promise<AdminGetUsersResponseDto[]> {
    const users = await this.adminRepo.findUsers(query);

    return AdminUserMapper.toResponseList(users);
  }

    async blockUser(userId: string): Promise<void> {
    if (!userId) {
      throw new AppError(STATUS.BAD_REQUEST, "User ID required");
    }

    await this.adminRepo.updateUserStatus(userId, true);
  }

  async unblockUser(userId: string): Promise<void> {
    if (!userId) {
      throw new AppError(STATUS.BAD_REQUEST, "User ID required");
    }

    await this.adminRepo.updateUserStatus(userId, false);
  }
}
