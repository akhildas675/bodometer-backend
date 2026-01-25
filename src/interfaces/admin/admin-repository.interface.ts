import { AdminGetTrainersDto, AdminGetUsersDto } from "../../dto/admin/admin.dto";
import {  AdminTrainerInterface, AdminUserInterface, Workout } from "./admin.interface";

export interface AdminRepositoryInterface{
    findUsers(query:AdminGetUsersDto):Promise<AdminUserInterface[]>;
    updateUserStatus(userId: string,isBlocked: boolean): Promise<void>;
    findTrainers(query:AdminGetTrainersDto):Promise<AdminTrainerInterface[]>;
    updateTrainerStatus(trainerId: string, isBlocked: boolean): Promise<void>;
    createWorkout(body:Workout):Promise<Workout>
    getAllWorkouts(): Promise<Workout[]>;
}