import { ChangePasswordDto, FindUserResponseDto, GetTrainersQueryDto, TrainerDetailDto, TrainerListResponseDto, UpdateUserProfileDto } from "../../../dto/user/user.dto";



export interface IUserService {
  fetchUser(userId: string): Promise<FindUserResponseDto>;
  updateProfile(userId: string, updateData: UpdateUserProfileDto): Promise<FindUserResponseDto>;
  uploadProfilePicture(userId: string, file: Express.Multer.File): Promise<string>;

  changePassword(userId: string, dto: ChangePasswordDto): Promise<void>;


  getTrainers(query: GetTrainersQueryDto): Promise<TrainerListResponseDto>;
  getTrainerById(id: string): Promise<TrainerDetailDto>;


}