import {
  FindUserResponseDto,
  UpdateUserProfileDto,
} from "../../dto/user/user.dto";
import { IUserRepository } from "../../interfaces/user/user-repository.interface";
import { IUserService } from "../../interfaces/user/user-service.interface";
import { UserMapper } from "../../mappers/user/user.mappers";
import { AppError } from "../../utils/appError";
import { STATUS } from "../../constants/statuscode";
import { IS3Service } from "../../interfaces/s3/s3-service.interface";
import { MESSAGES } from "../../constants/messages";

export class UserService implements IUserService {
  constructor(
    private _userRepo: IUserRepository,
    private _s3Service: IS3Service,
  ) {}

  async fetchUser(userId: string): Promise<FindUserResponseDto> {
    const user = await this._userRepo.findById(userId);

    if (!user) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.USER.USER_NOT_FOUND);
    }

    return UserMapper.toFindUserResponse(user);
  }

  async updateUserProfile(
    userId: string,
    updateData: UpdateUserProfileDto,
  ): Promise<FindUserResponseDto> {
    if (Object.keys(updateData).length === 0) {
      throw new AppError(STATUS.BAD_REQUEST, "No fields to update");
    }

    // Validate required fields
    if (updateData.gender && updateData.gender === "prefer_not_say") {
      throw new AppError(STATUS.BAD_REQUEST, "Please select a valid gender");
    }
    if (!updateData.dateOfBirth) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.COMMON.SELECT_CORRECT_DOB);
    }

    const dob = new Date(updateData.dateOfBirth);
    const today = new Date();

    const limitDate = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate(),
    );

    if (dob > limitDate) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.USER.AGE_RESTRICTION,
      );
    }

    const updatedUser = await this._userRepo.updateProfile(userId, updateData);

    if (!updatedUser) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.USER.USER_NOT_FOUND);
    }

    return UserMapper.toFindUserResponse(updatedUser);
  }

  async uploadProfilePicture(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.USER.USER_NOT_FOUND);
    }

    if (user.profilePic) {
      try {
        await this._s3Service.deleteFile(user.profilePic);
      } catch (error) {
        console.error("Error deleting old profile picture:", error);
      }
    }

    const profilePicUrl = await this._s3Service.uploadFile(
      file,
      `profile-pictures/${userId}`,
    );

    await this._userRepo.updateProfile(userId, { profilePic: profilePicUrl });

    return profilePicUrl;
  }
}
