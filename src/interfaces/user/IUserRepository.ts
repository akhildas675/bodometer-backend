import { IUser } from "../userInterfaces/userInterface";


export interface IUserRepository{
    findByUsername(username: string): Promise<IUser | null>; 
    findByEmail(email:string):Promise<IUser | null>;
    createUser(data:IUser):Promise<IUser>
}