import { AdminGetTrainersDto, AdminGetTrainersResponseDto, AdminGetUsersDto, AdminGetUsersResponseDto } from "../../dto/admin/admin.dto";

export interface AdminServiceInterface{
    fetchUsers(query:AdminGetUsersDto):Promise<AdminGetUsersResponseDto[]>;
    blockUser(userId: string): Promise<void>;
    unblockUser(userId: string): Promise<void>;
    fetchTrainers(query:AdminGetTrainersDto):Promise<AdminGetTrainersResponseDto[]>;
    blockTrainer(trainerId: string): Promise<void>;
  unblockTrainer(trainerId: string): Promise<void>;
}