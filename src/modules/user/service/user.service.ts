import { MESSAGES } from "@/constants/messages";
import { STATUS } from "@/constants/statuscode";
import { ITrainerProfileRepository } from '@/modules/trainer/interface/trainer.profile-repository.interface';
import { IUserRepository } from '@/modules/user/interface/user-repository.interface';
import { IS3Service } from '@/modules/s3/interface/s3-service.interface';
import { IUserService } from '@/modules/user/interface/user-service.interface';
import { UserMapper } from "../mapper/user.mappers";
import { AppError } from "@/utils/appError";
import bcrypt from "bcrypt";
import { hashPassword } from "@/utils/password";
import {
  ChangePasswordDto,
  FindUserResponseDto,
  UpdateUserProfileDto,
  GetUsersDto,
  GetUsersResponseDto,
} from "../dto/user.dto";
import { ROLES } from "@/constants/roles";
import { PaginatedResponseDto } from "@/dto/common.dto";

import { inject, injectable } from "inversify";
import { USER_TYPES } from "../user.types";
import { TRAINER_TYPES } from "../../trainer/trainer.types";

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(USER_TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(USER_TYPES.S3Service) private _s3Service: IS3Service,
    @inject(TRAINER_TYPES.TrainerProfileRepository) private _trainerProfileRepo: ITrainerProfileRepository,
  ) { }

  // Fetch user details
  async getUser(userId: string): Promise<FindUserResponseDto> {
    const user = await this._userRepository.findById(userId);
    if (!user)
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.USER.USER_NOT_FOUND);

    let profileData = null;
    if (user.role === ROLES.TRAINER) {
      profileData = await this._trainerProfileRepo.findByUserId(userId);
    }

    return UserMapper.toFindUserResponse(user, profileData);
  }

  // Update user profile
  async updateProfile(
    userId: string,
    updateData: UpdateUserProfileDto,
  ): Promise<FindUserResponseDto> {
    if (Object.keys(updateData).length === 0) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.NO_FIELDS_TO_UPDATE);
    }
    if (updateData.userName) {
      const existingUser = await this._userRepository.findByUsername(
        updateData.userName,
      );
      if (existingUser && existingUser.id !== userId) {
        throw new AppError(STATUS.CONFLICT, MESSAGES.USER.USERNAME_ALREADY_EXISTS);
      }
    }

    if (updateData.dateOfBirth) {
      const dob = new Date(updateData.dateOfBirth);
      const today = new Date();
      const limitDate = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate(),
      );
      if (dob > limitDate) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.USER.AGE_RESTRICTION);
      }
    }
    const updatedUser = await this._userRepository.updateProfile(userId, updateData);
    if (!updatedUser)
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.USER.USER_NOT_FOUND);

    // Update profile data
    if (updateData.gender || updateData.dateOfBirth) {
      const profileUpdates = {
        gender: updateData.gender,
        dateOfBirth: updateData.dateOfBirth
          ? new Date(updateData.dateOfBirth)
          : undefined,
      };

      if (updatedUser.role === ROLES.TRAINER) {
        await this._trainerProfileRepo.upsert({ userId }, profileUpdates);
      }
    }

    return this.getUser(userId);
  }

  // Upload profile picture
  async uploadProfilePicture(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const user = await this._userRepository.findById(userId);
    if (!user)
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.USER.USER_NOT_FOUND);
    if (user.profilePic) {
      try {
        await this._s3Service.deleteFile(user.profilePic);
      } catch {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.USER.PROFILE_PICTURE_DELETE_FAILED)
      }
    }
    const profilePicUrl = await this._s3Service.uploadFile(
      file,
      `profile-pictures/${userId}`,
    );
    await this._userRepository.updateProfile(userId, { profilePic: profilePicUrl });
    return profilePicUrl;
  }

  // Admin Methods
  async fetchUsers(
    query: GetUsersDto,
  ): Promise<PaginatedResponseDto<GetUsersResponseDto>> {
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
      data: UserMapper.toGetUsersResponseList(data),
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

  // Change user password
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this._userRepository.findById(userId);
    if (!user)
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.USER.USER_NOT_FOUND);

    const match = await bcrypt.compare(dto.currentPassword, user.password);
    if (!match)
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.PASSWORD.INCORRECT_CURRENT_PASSWORD,
      );

    const sameAsOld = await bcrypt.compare(dto.newPassword, user.password);
    if (sameAsOld)
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.PASSWORD.NEW_PASSWORD_SAME_AS_OLD,
      );

    const hashedPassword = await hashPassword(dto.newPassword);
    await this._userRepository.updatePassword(userId, hashedPassword);
  }
}
