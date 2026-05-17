import { PaginationMeta } from "../interfaces/domain.interface/common.interface";
import {
  UpdateUserProfileInterface,
  UserInterface,
} from "../interfaces/domain.interface/user.interface";
import { IUserRepository } from "../interfaces/repository-interface/user/user-repository.interface";
import { IUserDocument, UserModel } from "../models/user.model";
import { BaseRepository } from "./base/base.repository";

export default class UserRepository
  extends BaseRepository<UserInterface, IUserDocument>
  implements IUserRepository
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
      phoneNumber: doc.phoneNumber ?? null,
      password: doc.password,
      profilePic: doc.profilePic ?? null,
      role: doc.role,
      isVerified: doc.isVerified,
      isBlocked: doc.isBlocked,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  // Auth
  async findByEmail(email: string): Promise<UserInterface | null> {
    return this.findOne({ email });
  }

  async findByUsername(username: string): Promise<UserInterface | null> {
    return this.findOne({ userName: username });
  }

  async updatePassword(userId: string, password: string): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { password } });
  }

  async updateVerified(userId: string, isVerified: boolean): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { isVerified } });
  }

  // Profile (user & trainer)
  async updateProfile(
    userId: string,
    updateData: UpdateUserProfileInterface,
  ): Promise<UserInterface | null> {
    const updateFields: Partial<IUserDocument> = {};
    if (updateData.name !== undefined) updateFields.name = updateData.name;
    if (updateData.userName !== undefined)
      updateFields.userName = updateData.userName;
    if (updateData.phoneNumber !== undefined)
      updateFields.phoneNumber = updateData.phoneNumber;
    if (updateData.profilePic !== undefined)
      updateFields.profilePic = updateData.profilePic;

    return this.updateById(userId, updateFields);
  }

  //admin paginated list by role
  async findByRolePaginated(
    role: string,
    search?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
    page?: number,
    limit?: number,
  ): Promise<{ data: UserInterface[]; pagination: PaginationMeta }> {
    const filter: Record<string, unknown> = { role };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const sort: Record<string, 1 | -1> = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    const pageNum = page || 1;
    const limitNum = limit || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await this.countDocuments({ role });
    const docs = await UserModel.find(filter)
      .select("-password")
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    return {
      data: docs.map((doc) => this.toInterface(doc)),
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
      },
    };
  }

  //  block / unblock
  async updateBlockStatus(userId: string, isBlocked: boolean): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { isBlocked } });
  }
}
