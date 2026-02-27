
import { ITrainerRepository } from "@/interfaces/trainer/trainer-repository.interface";
import { TrainerProfileInterface, TrainerWorkoutList } from "@/interfaces/trainer/trainer.interface";
import { IUserDocument, UserModel } from "@/models/user.model";
import { IWorkoutDocument, WorkoutModel } from "@/models/workout.model";
import { UpdateUserProfileDto } from "@/dto/user/user.dto";

export default class TrainerRepository implements ITrainerRepository {

  
  async findById(userId: string): Promise<TrainerProfileInterface | null> {
    const doc = await UserModel.findById(userId).select("-password").exec();
    return doc ? this._toTrainerProfile(doc) : null;
  }

  async updateTrainerProfile(
    trainerId: string,
    updateData: UpdateUserProfileDto,
  ): Promise<TrainerProfileInterface | null> {
    const updateFields: Partial<UpdateUserProfileDto> = {};
    
    if (updateData.name !== undefined) updateFields.name = updateData.name;
    if (updateData.userName !== undefined) updateFields.userName = updateData.userName;
    if (updateData.phoneNumber !== undefined) updateFields.phoneNumber = updateData.phoneNumber;
    if (updateData.gender !== undefined) updateFields.gender = updateData.gender;
    if (updateData.profilePic !== undefined) updateFields.profilePic = updateData.profilePic;
    if (updateData.dateOfBirth !== undefined) updateFields.dateOfBirth = updateData.dateOfBirth;

    const doc = await UserModel.findByIdAndUpdate(
      trainerId,
      { $set: updateFields },
      { new: true, runValidators: true },
    )
      .select("-password")
      .exec();

    return doc ? this._toTrainerProfile(doc) : null;
  }

  private _toTrainerProfile(doc: IUserDocument): TrainerProfileInterface {
    return {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      userName: doc.userName,
      phoneNumber: doc.phoneNumber,
      gender: doc.gender,
      profilePic: doc.profilePic ?? null,
      dateOfBirth: doc.dateOfBirth ?? null,
    };
  }


  
  async getWorkoutList(): Promise<TrainerWorkoutList[]> {
    const docs = await WorkoutModel.find().exec();
    return docs.map((doc) => this._toWorkoutList(doc));
  }

  private _toWorkoutList(doc: IWorkoutDocument): TrainerWorkoutList {
    return {
      id: doc._id.toString(),
      workoutName: doc.workoutName,
    };
  }
}