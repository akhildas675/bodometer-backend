import { FindTrainerResponseDto, TrainerProfileDto, TrainerStatusResponseDto, UpdateTrainerProfileDto, GetAllTrainersDto, GetAllTrainersResponseDto, GetTrainerAppointmentsQueryDto, GetTrainerAppointmentsResponseDto, ApproveTrainerResponseDto, RejectTrainerResponseDto, TrainerListItemDto, GetTrainerByIdResponseDto } from "../../../modules/trainer/dto/trainer.dto";
import { PaginatedResponseDto } from "../../../dto/common.dto";
import { PaginatedResult } from '@/modules/base/interface/common.interface';



export interface ITrainerService {
  fetchTrainer(trainerId: string): Promise<FindTrainerResponseDto>;
  updateTrainerProfile(trainerId: string, updateData: UpdateTrainerProfileDto): Promise<FindTrainerResponseDto>;
  uploadTrainerProfilePicture(trainerId: string, file: Express.Multer.File): Promise<string>;
  uploadTrainerCoverPhoto(trainerId: string, file: Express.Multer.File): Promise<string>;
  uploadTrainerDocument(file: Express.Multer.File): Promise<string>;
  submitTrainerProfile(userId: string, data: TrainerProfileDto): Promise<void>;
  getTrainerStatus(userId: string): Promise<TrainerStatusResponseDto>;

  // Admin Methods
  getTrainers(query: GetAllTrainersDto, role?: string): Promise<PaginatedResponseDto<TrainerListItemDto | GetAllTrainersResponseDto>>;
  toggleStatusTrainer(trainerId: string): Promise<void>;
  getTrainerAppointments(query: GetTrainerAppointmentsQueryDto): Promise<PaginatedResult<GetTrainerAppointmentsResponseDto>>;
  getTrainerProfileById(profileId: string): Promise<GetTrainerByIdResponseDto>;
  approveTrainer(profileId: string): Promise<ApproveTrainerResponseDto>;
  rejectTrainer(profileId: string, reason: string): Promise<RejectTrainerResponseDto>;
}