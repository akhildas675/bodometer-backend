import { TrainerController } from "@/controllers/trainer/trainer.controller";
import { IS3Service } from "@/interfaces/s3/s3-service.interface";

import { ITrainerService } from "@/interfaces/trainer/trainer-service.interface";
import { ITrainerProfileRepository } from "@/interfaces/trainer/trainer.profile-repository.interface";

import { IWorkoutRepository } from "@/interfaces/workout/workout-repository.interface";
import TrainerProfileRepository from "@/repositories/trainer-profile.repository";
import UserRepository from "@/repositories/user.repository";
import WorkoutRepository from "@/repositories/workout.repository";
import { S3Service } from "@/services/s3/s3.service";

import { TrainerService } from "@/services/trainer/trainer.services";

export function createTrainerModule(){
    const userRepository = new UserRepository()
    const trainerProfileRepository:ITrainerProfileRepository= new TrainerProfileRepository();
    const workoutRepository:IWorkoutRepository =new WorkoutRepository()
    const s3Service:IS3Service = new S3Service()

    const trainerService:ITrainerService = new TrainerService(
        userRepository,
       trainerProfileRepository,
       workoutRepository,
        s3Service,
    );




    const trainerController = new TrainerController(trainerService)

    return {trainerController}
}