export interface ITrainerProfileService {
  createProfile(
    userId: string,
    data: {
      experienceInYears: number;
      bio: string;
      certificateFile: Express.Multer.File;
    }
  ): Promise<void>;
}
