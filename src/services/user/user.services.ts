import {
  FindUserResponseDto,
  UpdateUserProfileDto,
} from "../../dto/user/user.dto";
import { UserRepositoryInterface } from "../../interfaces/user/user-repository.interface";
import { UserServiceInterface } from "../../interfaces/user/user-service.interface";
import { UserMapper } from "../../mappers/user/user.mappers";
import { S3Service } from "../s3/s3.service";
import { AppError } from "../../utils/appError";
import { STATUS } from "../../constants/statuscode";

export class UserService implements UserServiceInterface {
  constructor(
    private userRepo: UserRepositoryInterface,
    private s3Service: S3Service,
  ) {}

  async fetchUser(userId: string): Promise<FindUserResponseDto> {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw new AppError(STATUS.NOT_FOUND, "User not found");
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
      throw new AppError(STATUS.BAD_REQUEST, "Please select the date of birth");
    }

    const dob = new Date(updateData.dateOfBirth);
    const today = new Date();

    const limitDate = new Date(
      today.getFullYear() - 15,
      today.getMonth(),
      today.getDate(),
    );

    if (dob > limitDate) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        "You must be at least 15 years old",
      );
    }

    const updatedUser = await this.userRepo.updateProfile(userId, updateData);

    if (!updatedUser) {
      throw new AppError(STATUS.NOT_FOUND, "User not found");
    }

    return UserMapper.toFindUserResponse(updatedUser);
  }

  async uploadProfilePicture(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError(STATUS.NOT_FOUND, "User not found");
    }

    if (user.profilePic) {
      try {
        await this.s3Service.deleteFile(user.profilePic);
      } catch (error) {
        console.error("Error deleting old profile picture:", error);
      }
    }

    const profilePicUrl = await this.s3Service.uploadFile(
      file,
      `profile-pictures/${userId}`,
    );

    await this.userRepo.updateProfile(userId, { profilePic: profilePicUrl });

    return profilePicUrl;
  }
}
