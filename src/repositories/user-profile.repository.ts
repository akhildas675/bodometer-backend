import { IUserProfile, IUserProfileRepository } from "@/interfaces/repository-interface/user/user-profile.repository.interface";
import { IUserProfileDocument, UserProfileModel } from "@/models/user-profile.model";
import { BaseRepository } from "./base/base.repository";

export class UserProfileRepository
  extends BaseRepository<IUserProfile, IUserProfileDocument>
  implements IUserProfileRepository {
  constructor() {
    super(UserProfileModel);
  }

  protected toInterface(doc: IUserProfileDocument): IUserProfile {
    return {
      userId: doc.userId.toString(),
      gender: doc.gender,
      dateOfBirth: doc.dateOfBirth,
    };
  }

  async findByUserId(userId: string): Promise<IUserProfile | null> {
    return this.findOne({ userId });
  }

  async createProfile(data: Partial<IUserProfile>): Promise<void> {
    await UserProfileModel.create(data);
  }

  async updateProfile(userId: string, data: Partial<IUserProfile>): Promise<void> {
    await UserProfileModel.updateOne({ userId }, { $set: data });
  }
}
