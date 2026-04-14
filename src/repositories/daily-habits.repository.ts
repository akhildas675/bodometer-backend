import { IUserDailyHabits, UserDailyHabitsModel } from "@/models/daily-habits.model";
import { BaseRepository } from "./base/base.repository";
import { IDailyHabitsRepository } from "@/interfaces/user/daily-habits-repository.interface";

export class DailyHabitsRepository extends BaseRepository<Record<string, unknown>, IUserDailyHabits> implements IDailyHabitsRepository {
  constructor() {
    super(UserDailyHabitsModel);
  }

  protected toInterface(doc: IUserDailyHabits): Record<string, unknown> {
    return doc.toObject() as Record<string, unknown>;
  }
}
