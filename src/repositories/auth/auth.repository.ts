import { IAuthRepository } from "@/interfaces/auth/auth-repository.interface";
import { UserInterface } from "@/interfaces/auth/auth.interface";
import { IUserDocument, UserModel } from "@/models/user.model";
import { BaseRepository } from "@/repositories/base/base.repository";

export default class AuthRepository
  extends BaseRepository<UserInterface, IUserDocument>
  implements IAuthRepository
{
  constructor() {
    super(UserModel);
  }

  protected toInterface(doc: IUserDocument): UserInterface {
    return {
      id: doc._id.toString(),
      name: doc.name,
      userName: doc.userName ?? "",
      email: doc.email,
      phoneNumber: doc.phoneNumber,
      password: doc.password,
      profilePic: doc.profilePic ?? null,
      gender: doc.gender ?? null,
      role: doc.role,
      isVerified: doc.isVerified,
      dateOfBirth: doc.dateOfBirth ?? null,
      isBlocked: doc.isBlocked,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findByUsername(username: string): Promise<UserInterface | null> {
    return this.findOne({ userName: username });
  }

  async findByEmail(email: string): Promise<UserInterface | null> {
    return this.findOne({ email });
  }

  async updatePassword(userId: string, password: string): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { password } });
  }
}