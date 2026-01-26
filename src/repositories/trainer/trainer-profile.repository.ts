import { TrainerProfile } from "../../interfaces/trainer/trainer.interface";
import { TrainerProfileRepositoryInterface } from "../../interfaces/trainer/trainer.profile-repository.interface";
import { TrainerProfileModel } from "../../models/trainer-profile.model";


export default class TrainerProfileRepository
  implements TrainerProfileRepositoryInterface {

  async findByUserId(userId: string): Promise<TrainerProfile | null> {
    const doc = await TrainerProfileModel.findOne({ userId });
    if (!doc) return null;

    return {
      userId: doc.userId.toString(),
      verificationStatus: doc.verificationStatus,
      rejectionReason: doc.rejectionReason ?? null,
    };
  }
}
