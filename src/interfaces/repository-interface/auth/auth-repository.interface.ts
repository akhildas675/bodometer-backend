import { UserInterface } from "../../service-interface/auth/auth.interface";

export interface IAuthRepository {
    findByUsername(username: string): Promise<UserInterface | null>;
    findByEmail(email: string): Promise<UserInterface  | null>;
    create(data: UserInterface): Promise<UserInterface >
    updatePassword(userId: string, password: string): Promise<void>;
    findById(id: string): Promise<UserInterface | null>;

}