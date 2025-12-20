import { IUserRepository } from "../../interfaces/user/IUserInterface";
import { IUser } from "../../interfaces/userInterfaces/userInterface";
import { IUserDocument, UserModel } from "../../models/userModel";

export default class UserRepository implements IUserRepository {
  async findByUsername(username: string): Promise<IUser | null> {
    const doc = await UserModel.findOne({ userName: username }).exec();
    return doc ? this.toIUser(doc) : null;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const doc = await UserModel.findOne({ email }).exec();
    return doc ? this.toIUser(doc) : null;
  }

  async createUser(data: IUser): Promise<IUser> {
    const doc = new UserModel(data);
    const saved = await doc.save();
    return this.toIUser(saved);
  }

  private toIUser(doc: IUserDocument): IUser {
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
      isVerified:doc.isVerified,
      dateOfBirth: doc.dateOfBirth ?? null,
      isBlocked: doc.isBlocked,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
