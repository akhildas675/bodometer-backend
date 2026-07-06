import { GetUsersDto, GetUsersResponseDto, ChangePasswordDto, FindUserResponseDto, UpdateUserProfileDto } from "../../../modules/user/dto/user.dto";
import { PaginatedResponseDto } from "../../../dto/common.dto";

export interface IUserService {
  getUser(userId: string): Promise<FindUserResponseDto>;
  updateProfile(userId: string, updateData: UpdateUserProfileDto): Promise<FindUserResponseDto>;
  uploadProfilePicture(userId: string, file: Express.Multer.File): Promise<string>;
  changePassword(userId: string, dto: ChangePasswordDto): Promise<void>;
  
  // Admin methods
  fetchUsers(query: GetUsersDto): Promise<PaginatedResponseDto<GetUsersResponseDto>>;
  blockUser(userId: string): Promise<void>;
  unblockUser(userId: string): Promise<void>;
}