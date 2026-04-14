import { IUserFitnessProfile, UserFitnessProfileModel } from "@/models/fitness-profile.model";
import { BaseRepository } from "./base/base.repository";
import { IFitnessProfileRepository } from "@/interfaces/user/fitness-profile-repository.interface";

export class FitnessProfileRepository extends BaseRepository<Record<string, unknown>, IUserFitnessProfile> implements IFitnessProfileRepository {
  constructor() {
    super(UserFitnessProfileModel);
  }

  protected toInterface(doc: IUserFitnessProfile): Record<string, unknown> {
    return doc.toObject() as Record<string, unknown>;
  }
}
