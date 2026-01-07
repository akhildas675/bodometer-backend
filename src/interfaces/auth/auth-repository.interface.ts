import { UserInterface } from "./auth.interface";

export interface AuthRepositoryInterface {
    findByUsername(username: string): Promise<UserInterface | null>;
    findByEmail(email: string): Promise<UserInterface  | null>;
    create(data: UserInterface): Promise<UserInterface >
    updatePassword(userId: string, password: string): Promise<void>;
}