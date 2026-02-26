
import {  Workout,
} from "./admin.interface";

export interface IAdminRepository {
  createWorkout(body: Workout): Promise<Workout>;
  getAllWorkouts(): Promise<Workout[]>;

}
