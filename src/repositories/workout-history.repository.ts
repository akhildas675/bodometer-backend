import { IUserWorkoutHistory, UserWorkoutHistoryModel } from "@/models/workout.history";
import { BaseRepository } from "./base/base.repository";
import { IWorkoutHistoryRepository } from "@/interfaces/user/workout-history-repository.interface";

export class WorkoutHistoryRepository extends BaseRepository<Record<string, unknown>, IUserWorkoutHistory> implements IWorkoutHistoryRepository {
  constructor() {
    super(UserWorkoutHistoryModel);
  }

  protected toInterface(doc: IUserWorkoutHistory): Record<string, unknown> {
    return doc.toObject() as Record<string, unknown>;
  }
}
