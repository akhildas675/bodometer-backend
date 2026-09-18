import { injectable } from "inversify";
import { ClientSession } from "mongoose";
import { BaseRepository } from "@/modules/base/repository/base.repository";
import {
  ITrainerAvailabilityOverride,
  TrainerAvailabilityOverrideModel,
} from "../model/trainer-availability-override.model";
import {
  CreateTrainerAvailabilityOverrideData,
  ITrainerAvailabilityOverrideRepository,
} from "../interface/repository.interface/trainer-availability-override-repository.interface";
import { TrainerAvailabilityOverride } from "../interface/domain/trainer-availability-override.interface";

@injectable()
export class TrainerAvailabilityOverrideRepository
  extends BaseRepository<
    TrainerAvailabilityOverride,
    ITrainerAvailabilityOverride
  >
  implements ITrainerAvailabilityOverrideRepository
{
  constructor() {
    super(TrainerAvailabilityOverrideModel);
  }

  protected toInterface(
    doc: ITrainerAvailabilityOverride,
  ): TrainerAvailabilityOverride {
    return {
      id: doc._id.toString(),
      trainerId: doc.trainerId.toString(),
      availabilityId: doc.availabilityId?.toString(),
      date: doc.date,
      shifts: doc.shifts,
      reason: doc.reason,
      status: doc.status,
    };
  }

  async createOne(
    data: CreateTrainerAvailabilityOverrideData,
    session?: ClientSession,
  ): Promise<TrainerAvailabilityOverride> {
    const doc = new TrainerAvailabilityOverrideModel({
      trainerId: data.trainerId,
      availabilityId: data.availabilityId,
      date: data.date,
      shifts: data.shifts,
      reason: data.reason ?? "",
      status: data.status || "ACTIVE",
    });

    await doc.save({ session });
    return this.toInterface(doc);
  }

  async getByTrainerId(trainerId: string): Promise<TrainerAvailabilityOverride[]> {
    const docs = await TrainerAvailabilityOverrideModel.find({
      trainerId,
    }).exec();

    return docs.map((doc) => this.toInterface(doc));
  }

  async findById(id: string): Promise<TrainerAvailabilityOverride | null> {
    const doc = await TrainerAvailabilityOverrideModel.findById(id).exec();
    return doc ? this.toInterface(doc) : null;
  }

  async updateById(
    id: string,
    data: Partial<ITrainerAvailabilityOverride>,
    session?: ClientSession,
  ): Promise<TrainerAvailabilityOverride | null> {
    const doc = await TrainerAvailabilityOverrideModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true, session },
    ).exec();

    return doc ? this.toInterface(doc) : null;
  }

  async deleteById(id: string, session?: ClientSession): Promise<boolean> {
    const res = await TrainerAvailabilityOverrideModel.findByIdAndDelete(id, { session }).exec();
    return !!res;
  }
}
