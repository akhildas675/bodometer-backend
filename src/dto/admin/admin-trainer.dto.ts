import { AdminBaseUserResponseDto } from "./admin.dto";

export interface AdminGetTrainersDto {
  page?: number;
  limit?: number;
  search?: string;
  isBlocked?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AdminGetTrainersResponseDto
  extends AdminBaseUserResponseDto {}

export interface AdminBlockUnblockTrainerDto {
  trainerId: string;
}
export interface ApproveTrainerResponseDto {
  profileId: string;
  status: string;
}

export interface RejectTrainerBodyDto {
  reason: string;
}

export interface GetTrainerAppointmentsQueryDto {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  status?: string;
}
