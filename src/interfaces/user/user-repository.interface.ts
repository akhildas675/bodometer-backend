import { UserProfile } from "./user.interface";
import { UpdateUserProfileDto } from "../../dto/user/user.dto";

export interface UserRepositoryInterface {
  findById(userId: string): Promise<UserProfile | null>;
  updateProfile(userId: string, updateData: UpdateUserProfileDto): Promise<UserProfile | null>;
}