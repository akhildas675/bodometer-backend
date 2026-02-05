import { IUserRepository } from "../../interfaces/user/user-repository.interface";
import { UserProfile } from "../../interfaces/user/user.interface";
import { UpdateUserProfileDto } from "../../dto/user/user.dto";
import { IUserDocument, UserModel } from "../../models/user.model";
import { BaseRepository } from "../base/base.repository";

export default class UserRepository
  extends BaseRepository<UserProfile, IUserDocument>
  implements IUserRepository
{
  constructor() {
    super(UserModel);
  }

  protected toInterface(doc: IUserDocument): UserProfile {
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

  async findById(userId: string): Promise<UserProfile | null> {
    const doc = await UserModel.findById(userId).select("-password").exec();
    return doc ? this.toInterface(doc) : null;
  }

  async updateProfile(
    userId: string,
    updateData: UpdateUserProfileDto,
  ): Promise<UserProfile | null> {
    const updateFields: Partial<UpdateUserProfileDto> = {};
    if (updateData.name !== undefined) updateFields.name = updateData.name;
    if (updateData.userName !== undefined)
      updateFields.userName = updateData.userName;
    if (updateData.phoneNumber !== undefined)
      updateFields.phoneNumber = updateData.phoneNumber;
    if (updateData.gender !== undefined)
      updateFields.gender = updateData.gender;
    if (updateData.profilePic !== undefined)
      updateFields.profilePic = updateData.profilePic;
    if (updateData.dateOfBirth !== undefined)
      updateFields.dateOfBirth = updateData.dateOfBirth;

    const doc = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true },
    )
      .select("-password")
      .exec();

    return doc ? this.toInterface(doc) : null;
  }
}