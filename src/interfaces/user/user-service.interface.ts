import { FindUserResponseDto, UpdateUserProfileDto } from "../../dto/user/user.dto";

export interface IUserService {
  fetchUser(userId: string): Promise<FindUserResponseDto>;
  updateUserProfile(userId: string, updateData: UpdateUserProfileDto): Promise<FindUserResponseDto>;
  uploadProfilePicture(userId: string, file: Express.Multer.File): Promise<string>;
}