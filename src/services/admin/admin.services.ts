import {
  AddWorkoutDto,
  AddWorkoutResponseDto,

} from "../../dto/admin/admin.dto";
import { IAdminService } from "../../interfaces/admin/admin-service.interface";
import {

  WorkoutMapper,
} from "../../mappers/admin/admin.mappers";

import {  Workout } from "../../interfaces/admin/admin.interface";

import { IAdminRepository } from "../../interfaces/admin/admin-repository.interface";
import { IS3Service } from "../../interfaces/s3/s3-service.interface";


export class AdminService implements IAdminService {
  constructor(
    private _adminRepo: IAdminRepository,
    private _s3Service: IS3Service
  ) { }
  
    //workouts
  
    async workoutAdd(body: AddWorkoutDto): Promise<AddWorkoutResponseDto> {
      const imageUrl = await this._s3Service.uploadFile(body.file, "workouts");
  
      const workout: Workout = {
        workoutName: body.workoutName,
        workoutDescription: body.workoutDescription,
        workoutImage: imageUrl,
        isActive: true,
      };
  
      const savedWorkout = await this._adminRepo.createWorkout(workout);
  
      return WorkoutMapper.toResponse(savedWorkout);
    }
  
    async fetchWorkouts(): Promise<Workout[]> {
      return this._adminRepo.getAllWorkouts();
    }

 
}
