import { IBaseRepository } from "../base/base-repository.interface";
import { IUserWorkoutHistory } from "@/models/workout.history";

export interface IWorkoutHistoryRepository extends IBaseRepository<Record<string, unknown>, IUserWorkoutHistory> {
}
