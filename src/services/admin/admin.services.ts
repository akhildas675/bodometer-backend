import { STATUS } from "../../constants/statuscode";
import { AdminGetTrainersDto, AdminGetTrainersResponseDto, AdminGetUsersDto, AdminGetUsersResponseDto } from "../../dto/admin/admin.dto";
import { AdminServiceInterface } from "../../interfaces/admin/admin-service.interface";
import { AdminAccountMapper } from "../../mappers/admin/admin.mappers";

import AdminRepository from "../../repositories/admin/admin.repository";
import { AppError } from "../../utils/appError";


export class AdminService implements AdminServiceInterface {
  constructor(
    private adminRepo: AdminRepository
  ) { }

  async fetchUsers(
    query: AdminGetUsersDto
  ): Promise<AdminGetUsersResponseDto[]> {
    const users = await this.adminRepo.findUsers(query);

    return AdminAccountMapper.toResponseList(users);
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

  async fetchTrainers(query:AdminGetTrainersDto):Promise<AdminGetTrainersResponseDto[]>{
    const trainer = await this.adminRepo.findTrainers(query)
    return AdminAccountMapper.toResponseList(trainer);
  }


async blockTrainer(trainerId: string): Promise<void> {
  if (!trainerId) {
    throw new AppError(STATUS.BAD_REQUEST, "Trainer ID required");
  }

  await this.adminRepo.updateTrainerStatus(trainerId, true);
}

async unblockTrainer(trainerId: string): Promise<void> {
  if (!trainerId) {
    throw new AppError(STATUS.BAD_REQUEST, "Trainer ID required");
  }

  await this.adminRepo.updateTrainerStatus(trainerId, false);
}
}
