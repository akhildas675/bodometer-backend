import { IUserRepository } from '@/modules/user/interface/user-repository.interface';
import { Container } from "inversify";
import { USER_TYPES } from "./user.types";
import UserRepository from "../auth/repository/user.repository";
import { IUserService } from '@/modules/user/interface/user-service.interface';
import { UserService } from "./service/user.service";
import { UserController } from "./controller/user.controller";

export const loadUserBindings=(
    container:Container
)=>{

    container.bind<IUserRepository>(USER_TYPES.UserRepository)
    .to(UserRepository)

    container.bind<IUserService>(USER_TYPES.UserService)
    .to(UserService)

    container.bind<UserController>(USER_TYPES.UserController)
    .to(UserController)

}