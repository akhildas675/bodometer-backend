import { TrainerListItemDto } from "@/dto/user/user.dto";
import { ITrainerWithProfile } from "@/interfaces/trainer/trainer.interface";


export class UserTrainerMapper {
  static toListItemDto(trainer: ITrainerWithProfile): TrainerListItemDto {
    return {
      _id: trainer.user._id?.toString() || "",
      name: trainer.user.name,
      profilePic: trainer.user.profilePic || null,
      experienceInYears: trainer.profile.experienceInYears,
      bio: trainer.profile.bio,
      specializations: (trainer.profile.specializationIds as unknown as {
        _id: { toString(): string };
        workoutName: string;
      }[]).map((s) => ({
        _id: s._id.toString(),
        workoutName: s.workoutName,
      })),
    };
  }

  static toListItemDtoArray(trainers: ITrainerWithProfile[]): TrainerListItemDto[] {
    return trainers.map((t) => this.toListItemDto(t));
  }
}