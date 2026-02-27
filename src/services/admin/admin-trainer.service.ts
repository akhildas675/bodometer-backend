import { MESSAGES } from "../../constants/messages";
import { STATUS } from "../../constants/statuscode";
import { VERIFICATION_STATUS } from "../../constants/verification.constants";
import { AdminGetTrainersDto, AdminGetTrainersResponseDto, GetTrainerAppointmentsQueryDto } from "../../dto/admin/admin-trainer.dto";
import { PaginatedResponseDto } from "../../dto/admin/admin.dto";
import { ApproveTrainerResponseDto, GetTrainerAppointmentsResponseDto, GetTrainerByIdResponseDto, RejectTrainerResponseDto } from "../../dto/trainer/trainer.dto";
import { PaginatedResult } from "../../interfaces/admin/admin.interface";
import { IAdminTrainerRepository } from "../../interfaces/admin/admin.trainer-repository.interface";
import { IAdminTrainerService } from "../../interfaces/admin/admin.trainer-service.interface";
import { AdminAccountMapper, TrainerMapper } from "../../mappers/admin/admin.mappers";
import { AppError } from "../../utils/appError";

export class AdminTrainerService implements IAdminTrainerService {
    constructor(
        private _adminTrainerRepository: IAdminTrainerRepository,
    ) { }




    async fetchTrainers(
        query: AdminGetTrainersDto,
    ): Promise<PaginatedResponseDto<AdminGetTrainersResponseDto>> {
        const { trainers, total } = await this._adminTrainerRepository.findTrainers(query);

        const page = query.page || 1;
        const limit = query.limit || 10;
        const totalPages = Math.ceil(total / limit);

        return {
            data: AdminAccountMapper.toResponseList(trainers),
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }

    async blockTrainer(trainerId: string): Promise<void> {
        if (!trainerId) {
            throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
        }

        await this._adminTrainerRepository.updateTrainerStatus(trainerId, true);
    }

    async unblockTrainer(trainerId: string): Promise<void> {
        if (!trainerId) {
            throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
        }

        await this._adminTrainerRepository.updateTrainerStatus(trainerId, false);
    }

    async getTrainerAppointments(
       data:GetTrainerAppointmentsQueryDto
    ): Promise<PaginatedResult<GetTrainerAppointmentsResponseDto>> {
        try {
            const { data, pagination } = await this._adminTrainerRepository.getAllTrainersWithProfiles();
            return {
                data: TrainerMapper.toDtoArray(data),
                pagination,
            };
        } catch (error) {
            console.error('Error in getTrainerAppointments:', error);
            throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.ADMIN.APPOINTMENTS_FETCHED_FAILED);
        }
    }

    async getTrainerByProfileId(
        profileId: string,
    ): Promise<GetTrainerByIdResponseDto> {
        try {
            const trainer = await this._adminTrainerRepository.getTrainerByProfileId(profileId);

            if (!trainer) {
                throw new AppError(STATUS.NOT_FOUND, MESSAGES.TRAINER.NOT_FOUND);
            }

            return TrainerMapper.toDetailDto(trainer);
        } catch (error) {
            console.error("Error in getTrainerByProfileId:", error);
            if (error instanceof AppError) throw error;
            throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.ADMIN.TRAINER_PROFILE_FETCHED_FAILED);
        }
    }

    async approveTrainer(profileId: string): Promise<ApproveTrainerResponseDto> {
        try {
            const profile = await this._adminTrainerRepository.findTrainerProfileById(profileId);
            if (!profile) {
                throw new AppError(STATUS.NOT_FOUND, MESSAGES.ADMIN.TRAINER_PROFILE_FETCHED_FAILED);
            }

            if (profile.verificationStatus === VERIFICATION_STATUS.APPROVED) {
                throw new AppError(STATUS.NOT_FOUND, MESSAGES.ADMIN.VERIFICATION_APPROVED_EXISTS);
            }

            const updatedProfile =
                await this._adminTrainerRepository.updateTrainerVerificationStatus(
                    profileId,
                    VERIFICATION_STATUS.APPROVED,
                    null,
                );

            if (!updatedProfile) {
                throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.ADMIN.VERIFICATION_APPROVED_FAILED);
            }

            return TrainerMapper.toApproveDto(updatedProfile);
        } catch (error) {
            console.error("Error in approveTrainer:", error);
            if (error instanceof AppError) throw error;
            throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.ADMIN.VERIFICATION_APPROVED_FAILED);
        }
    }

    async rejectTrainer(
        profileId: string,
        reason: string,
    ): Promise<RejectTrainerResponseDto> {
        try {
            if (!reason || reason.trim().length === 0) {
                throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.REQUIRED_FIELD);
            }

            const profile = await this._adminTrainerRepository.findTrainerProfileById(profileId);
            if (!profile) {
                throw new AppError(STATUS.NOT_FOUND, MESSAGES.ADMIN.TRAINER_PROFILE_NOT_FOUND);
            }

            const updatedProfile =
                await this._adminTrainerRepository.updateTrainerVerificationStatus(
                    profileId,
                    VERIFICATION_STATUS.REJECTED,
                    reason,
                );

            if (!updatedProfile) {
                throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.ADMIN.TRAINER_FAILED_TO_REJECTED);
            }

            return TrainerMapper.toRejectDto(updatedProfile);
        } catch (error) {
            console.error("Error in rejectTrainer:", error);
            if (error instanceof AppError) throw error;
            throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.ADMIN.TRAINER_FAILED_TO_REJECTED);
        }
    }
}