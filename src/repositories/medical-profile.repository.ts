import { IUserMedicalProfile, UserMedicalProfileModel } from "@/models/medical-profile.model";
import { BaseRepository } from "./base/base.repository";
import { IMedicalProfileRepository } from "@/interfaces/user/medical-profile-repository.interface";

export class MedicalProfileRepository extends BaseRepository<Record<string, unknown>, IUserMedicalProfile> implements IMedicalProfileRepository {
  constructor() {
    super(UserMedicalProfileModel);
  }

  protected toInterface(doc: IUserMedicalProfile): Record<string, unknown> {
    return doc.toObject() as Record<string, unknown>;
  }
}
