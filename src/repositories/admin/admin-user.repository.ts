
import { ROLES } from "@/constants/roles";
import { AdminUserInterface } from "@/interfaces/admin/admin.interface";
import { IAdminUserRepository } from "@/interfaces/admin/admin.user-repository.interface";
import { IUserDocument, UserModel } from "@/models/user.model";
import { BaseRepository } from "@/repositories/base/base.repository";
import { AdminGetUsersDto } from "@/dto/admin/admin-user.dto";

export default class AdminUserRepository extends BaseRepository<AdminUserInterface, IUserDocument> implements IAdminUserRepository {
  
    constructor() {
        super(UserModel)
    }

      protected toInterface(doc: IUserDocument): AdminUserInterface {
        return {
          id: doc._id.toString(),
          name: doc.name,
          email: doc.email,
          role: doc.role as typeof ROLES.USER,
          isBlocked: doc.isBlocked,
          isVerified: doc.isVerified,
          createdAt: doc.createdAt.toISOString(),
        };
      }

    // User management
    async findUsers(query: AdminGetUsersDto): Promise<{ users: AdminUserInterface[]; total: number }> {

        const filter: Record<string, unknown> = { role: ROLES.USER };


        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: 'i' } },
                { email: { $regex: query.search, $options: 'i' } }
            ];
        }


        const sort: Record<string, 1 | -1> = {};
        if (query.sortBy) {
            sort[query.sortBy] = query.sortOrder === 'desc' ? -1 : 1;
        } else {
            sort.createdAt = -1;
        }

        //pagination
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        const total = await UserModel.countDocuments({ role: "user" })

        const docs = await UserModel.find(filter)
            .select("-password")
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const users = docs.map((doc) => this.toInterface(doc));
        return { users, total };
    }

    async updateUserStatus(userId: string, isBlocked: boolean): Promise<void> {
        await UserModel.updateOne({ _id: userId }, { $set: { isBlocked } });
    }



}