import { Role } from "../../constants/identity.constants";

export interface AdminGetUsersDto {
    page?: number;
    limit?: number;
    search?: string;
    role?: Exclude<Role,"admin">;
    isBlocked?: boolean
}

export interface AdminGetUsersResponseDto{
    id:string;
    name:string;
    email:string;
    role:Exclude<Role,"admin">,
    isBlocked:boolean;
    isVerified:boolean,
    createdAt:string,
    profilePic?:string | null;
}

export interface AdminBlockUnBlockDto{
    userId:string;
}