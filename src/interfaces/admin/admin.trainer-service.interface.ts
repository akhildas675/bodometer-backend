import { AdminGetTrainersDto, AdminGetTrainersResponseDto, PaginatedResponseDto } from "../../dto/admin/admin.dto";
import { ApproveTrainerResponseDto, GetTrainerAppointmentsResponseDto, GetTrainerByIdResponseDto, RejectTrainerResponseDto } from "../../dto/trainer/trainer.dto";
import { PaginatedResult } from "./admin.interface";

export interface IAdminTrainerService{
    fetchTrainers(
        query: AdminGetTrainersDto
      ): Promise<PaginatedResponseDto<AdminGetTrainersResponseDto>>;
      blockTrainer(trainerId: string): Promise<void>;
      unblockTrainer(trainerId: string): Promise<void>;
      getTrainerAppointments(
      search?: string,
      sortBy?: string,
      sortOrder?: 'asc' | 'desc',
      page?: number,
      limit?: number,
      status?: string
    ): Promise<PaginatedResult<GetTrainerAppointmentsResponseDto>>;
      getTrainerByProfileId(profileId: string): Promise<GetTrainerByIdResponseDto>;
      approveTrainer(profileId: string): Promise<ApproveTrainerResponseDto>;
      rejectTrainer(
        profileId: string,
        reason: string,
      ): Promise<RejectTrainerResponseDto>;
}