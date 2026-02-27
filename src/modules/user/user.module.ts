import { UserController } from "@/controllers/user/user.controller";
import { IS3Service } from "@/interfaces/s3/s3-service.interface";
import { IUserRepository } from "@/interfaces/user/user-repository.interface";
import { IUserService } from "@/interfaces/user/user-service.interface";
import UserRepository from "@/repositories/user/user.repository";
import { S3Service } from "@/services/s3/s3.service";
import { UserService } from "@/services/user/user.services";

export function createUserModule(){

    const userRepository:IUserRepository=new UserRepository();
    const s3Service:IS3Service=new S3Service();


    const userService:IUserService = new UserService(
        userRepository,
        s3Service
    );

    const userController = new UserController(userService);

    return {userController}
}