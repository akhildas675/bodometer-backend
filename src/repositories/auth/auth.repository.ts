import { AuthRepositoryInterface } from "../../interfaces/auth/auth-repository.interface";
import { UserInterface } from "../../interfaces/auth/auth.interface";
import { IUserDocument, UserModel } from "../../models/user.model";


export default class AuthRepository implements AuthRepositoryInterface {
    async create(data: UserInterface): Promise<UserInterface> {
        const doc = new UserModel(data);
        const saved = await doc.save();
        return this.toUserInterface(saved);
    }
    async findByUsername(username: string): Promise<UserInterface | null> {
        const doc = await UserModel.findOne({ userName: username })
        return doc ? this.toUserInterface(doc) : null;
    }

    async findByEmail(email: string): Promise<UserInterface | null> {
        const doc = await UserModel.findOne({ email }).exec();
        return doc ? this.toUserInterface(doc) : null;
    }
    async findById(id: string): Promise<UserInterface | null> {
        const doc = await UserModel.findById(id).exec();
        return doc ? this.toUserInterface(doc) : null;
    }



    private toUserInterface(doc: IUserDocument): UserInterface {
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

    async updatePassword(userId: string, password: string): Promise<void> {
        await UserModel.updateOne(
            { _id: userId },
            { $set: { password } }
        );
    }
}