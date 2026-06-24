
import { MESSAGES } from "../../constants/messages";
import { ROLES } from "../../constants/roles";
import { STATUS } from "../../constants/statuscode";
import { VERIFICATION_STATUS } from "../../constants/verification.constants";
import {
  AdminGetUsersDto,
  AdminGetUsersResponseDto,
} from "../../dto/user/user.dto";
import {
  AdminGetTrainersDto,
  AdminGetTrainersResponseDto,
  GetTrainerAppointmentsQueryDto,
  GetTrainerAppointmentsResponseDto,
  GetTrainerByIdResponseDto,
  ApproveTrainerResponseDto,
  RejectTrainerResponseDto,
} from "../../dto/trainer/trainer.dto";

import { PaginatedResponseDto } from "../../dto/common.dto";

import { PaginatedResult } from "../../interfaces/domain.interface/common.interface";

import { ITrainerProfileRepository } from "../../interfaces/repository-interface/trainer/trainer.profile-repository.interface";
import { IUserRepository } from "../../interfaces/repository-interface/user/user-repository.interface";
import { IAdminService } from "../../interfaces/service-interface/admin/admin-service.interface";
import { IS3Service } from "../../interfaces/service-interface/s3/s3-service.interface";
import {
  AdminAccountMapper,
  TrainerMapper,
} from "../../mappers/admin/admin.mappers";

import { AppError } from "../../utils/appError";

import { ISubscriptionPlanRepository } from "@/modules/subscription/interface/repository.interface/subscription-plan.repository";
import {
  generateKeySlug,
  generateOptionValue,
} from "@/utils/string-formatters";


export class AdminService implements IAdminService {


  constructor(
    private _userRepository: IUserRepository,
    private _trainerProfileRepository: ITrainerProfileRepository,
    private _s3Service: IS3Service,
    private _subscriptionPlanRepository: ISubscriptionPlanRepository,

  ) {}

  //  Users
  async fetchUsers(
    query: AdminGetUsersDto,
  ): Promise<PaginatedResponseDto<AdminGetUsersResponseDto>> {
    const { data, pagination } = await this._userRepository.findByRolePaginated(
      ROLES.USER,
      query.search,
      query.sortBy,
      query.sortOrder,
      query.page,
      query.limit,
    );

    const page = query.page || 1;
    const limit = query.limit || 10;
    const totalPages = Math.ceil(pagination.totalItems / limit);

    return {
      data: AdminAccountMapper.toResponseList(data),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: pagination.totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async blockUser(userId: string): Promise<void> {
    if (!userId)
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
    await this._userRepository.updateBlockStatus(userId, true);
  }

  async unblockUser(userId: string): Promise<void> {
    if (!userId)
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
    await this._userRepository.updateBlockStatus(userId, false);
  }

  //Trainers
  async fetchTrainers(
    query: AdminGetTrainersDto,
  ): Promise<PaginatedResponseDto<AdminGetTrainersResponseDto>> {
    const { data, pagination } = await this._userRepository.findByRolePaginated(
      ROLES.TRAINER,
      query.search,
      query.sortBy,
      query.sortOrder,
      query.page,
      query.limit,
    );

    const page = query.page || 1;
    const limit = query.limit || 10;
    const totalPages = Math.ceil(pagination.totalItems / limit);

    return {
      data: AdminAccountMapper.toResponseList(data),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: pagination.totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async blockTrainer(trainerId: string): Promise<void> {
    if (!trainerId)
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
    await this._userRepository.updateBlockStatus(trainerId, true);
  }

  async unblockTrainer(trainerId: string): Promise<void> {
    if (!trainerId)
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
    await this._userRepository.updateBlockStatus(trainerId, false);
  }

  async getTrainerAppointments(
    query: GetTrainerAppointmentsQueryDto,
  ): Promise<PaginatedResult<GetTrainerAppointmentsResponseDto>> {
    const { data, pagination } =
      await this._trainerProfileRepository.findAllWithUserPaginated(
        query.search,
        query.sortBy,
        query.sortOrder,
        query.page,
        query.limit,
        query.status,
      );

    return {
      data: TrainerMapper.toDtoArray(data),
      pagination,
    };
  }

  async getTrainerByProfileId(
    profileId: string,
  ): Promise<GetTrainerByIdResponseDto> {
    const trainer =
      await this._trainerProfileRepository.findByIdWithUser(profileId);
    if (!trainer)
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.TRAINER.NOT_FOUND);
    return TrainerMapper.toDetailDto(trainer);
  }

  async approveTrainer(profileId: string): Promise<ApproveTrainerResponseDto> {
    const profile = await this._trainerProfileRepository.findById(profileId);
    if (!profile)
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.ADMIN.TRAINER_PROFILE_NOT_FOUND,
      );

    if (profile.verificationStatus === VERIFICATION_STATUS.APPROVED) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.ADMIN.VERIFICATION_APPROVED_EXISTS,
      );
    }

    const updated =
      await this._trainerProfileRepository.updateVerificationStatus(
        profileId,
        VERIFICATION_STATUS.APPROVED,
        null,
      );

    if (!updated)
      throw new AppError(
        STATUS.INTERNAL_ERROR,
        MESSAGES.ADMIN.VERIFICATION_APPROVED_FAILED,
      );

    return TrainerMapper.toApproveDto(updated);
  }

  async rejectTrainer(
    profileId: string,
    reason: string,
  ): Promise<RejectTrainerResponseDto> {
    if (!reason?.trim()) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.VALIDATION.REQUIRED_FIELD,
      );
    }

    const profile = await this._trainerProfileRepository.findById(profileId);
    if (!profile)
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.ADMIN.TRAINER_PROFILE_NOT_FOUND,
      );

    const updated =
      await this._trainerProfileRepository.updateVerificationStatus(
        profileId,
        VERIFICATION_STATUS.REJECTED,
        reason,
      );

    if (!updated)
      throw new AppError(
        STATUS.INTERNAL_ERROR,
        MESSAGES.ADMIN.TRAINER_FAILED_TO_REJECTED,
      );

    return TrainerMapper.toRejectDto(updated);
  }
}
