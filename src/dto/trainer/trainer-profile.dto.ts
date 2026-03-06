import { Gender } from "@/constants/identity.constants"

export interface TrainerProfileDto {
  profileImageFile: Express.Multer.File; 
  certificateFile: Express.Multer.File;   
  dateOfBirth: string;
  gender: Gender;
  experienceInYears: number;            
  bio: string;
  specializationIds: string[];           
}