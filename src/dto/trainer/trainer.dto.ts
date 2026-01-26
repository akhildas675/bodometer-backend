export interface WorkoutListDto{
    id:string;
    workoutList:string;
}


export interface CreateTrainerProfileDto {
  experienceInYears: number;
  bio: string;
  certificateUrl: string;
}
export interface TrainerProfileResponseDto {
  success: true;
  message: string;
}
