import { AdminGetTrainersDto, AdminGetTrainersResponseDto, GetTrainerAppointmentsQueryDto } from "../../dto/admin/admin-trainer.dto";
import { PaginatedResponseDto } from "../../dto/admin/admin.dto";
import { ApproveTrainerResponseDto, GetTrainerAppointmentsResponseDto, GetTrainerByIdResponseDto, RejectTrainerResponseDto } from "../../dto/trainer/trainer.dto";
import { PaginatedResult } from "./admin.interface";

export interface IAdminTrainerService{
    fetchTrainers(
        query: AdminGetTrainersDto
      ): Promise<PaginatedResponseDto<AdminGetTrainersResponseDto>>;
      blockTrainer(trainerId: string): Promise<void>;
      unblockTrainer(trainerId: string): Promise<void>;
      getTrainerAppointments(
      query: GetTrainerAppointmentsQueryDto
    ): Promise<PaginatedResult<GetTrainerAppointmentsResponseDto>>;
      getTrainerByProfileId(profileId: string): Promise<GetTrainerByIdResponseDto>;
      approveTrainer(profileId: string): Promise<ApproveTrainerResponseDto>;
      rejectTrainer(
        profileId: string,
        reason: string,
      ): Promise<RejectTrainerResponseDto>;
}