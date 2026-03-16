import { AdminController } from "@/controllers/admin/admin.controller";
import { ISubscriptionRepository } from "@/interfaces/subscription/subscription-repository.interface";
import { IS3Service } from "@/interfaces/s3/s3-service.interface";
import { ITrainerProfileRepository } from "@/interfaces/trainer/trainer.profile-repository.interface";
import { IUserRepository } from "@/interfaces/user/user-repository.interface";
import { IWorkoutRepository } from "@/interfaces/workout/workout-repository.interface";
import SubscriptionRepository from "@/repositories/subscription.repository";
import TrainerProfileRepository from "@/repositories/trainer-profile.repository";
import UserRepository from "@/repositories/user.repository";
import WorkoutRepository from "@/repositories/workout.repository";
import { AdminService } from "@/services/admin/admin.services";
import { S3Service } from "@/services/s3/s3.service";

export function createAdminModule(){

  const userRepository:IUserRepository = new UserRepository();
  const trainerProfileRepository:ITrainerProfileRepository = new TrainerProfileRepository();
  const workoutRepository:IWorkoutRepository= new WorkoutRepository();

  const subscriptionRepository:ISubscriptionRepository= new SubscriptionRepository()
    const s3Service:IS3Service=new S3Service();
    const adminService=new AdminService(
        userRepository,
        trainerProfileRepository,
        workoutRepository,
        subscriptionRepository,
        s3Service,

    );

    const adminController = new AdminController(adminService)

    return {adminController}
}