import { FindTrainerResponseDto, TrainerProfileDto, TrainerStatusResponseDto, UpdateTrainerProfileDto, GetAllTrainersDto, GetAllTrainersResponseDto, GetTrainerAppointmentsQueryDto, GetTrainerAppointmentsResponseDto, GetTrainerByIdResponseDto, ApproveTrainerResponseDto, RejectTrainerResponseDto } from "../../../modules/trainer/dto/trainer.dto";
import { PaginatedResponseDto } from "../../../dto/common.dto";
import { PaginatedResult } from '@/modules/base/interface/common.interface';



export interface ITrainerService {
  fetchTrainer(trainerId: string): Promise<FindTrainerResponseDto>;
  updateTrainerProfile(trainerId: string, updateData: UpdateTrainerProfileDto): Promise<FindTrainerResponseDto>;
  uploadTrainerProfilePicture(trainerId: string, file: Express.Multer.File): Promise<string>;
  uploadTrainerDocument(file: Express.Multer.File): Promise<string>;
  createProfile(userId: string, data: TrainerProfileDto): Promise<void>;
  getTrainerStatus(userId: string): Promise<TrainerStatusResponseDto>;

  // Admin Methods
  fetchTrainers(query: GetAllTrainersDto): Promise<PaginatedResponseDto<GetAllTrainersResponseDto>>;
  blockTrainer(trainerId: string): Promise<void>;
  unblockTrainer(trainerId: string): Promise<void>;
  getTrainerAppointments(query: GetTrainerAppointmentsQueryDto): Promise<PaginatedResult<GetTrainerAppointmentsResponseDto>>;
  getTrainerByProfileId(profileId: string): Promise<GetTrainerByIdResponseDto>;
  approveTrainer(profileId: string): Promise<ApproveTrainerResponseDto>;
  rejectTrainer(profileId: string, reason: string): Promise<RejectTrainerResponseDto>;
}