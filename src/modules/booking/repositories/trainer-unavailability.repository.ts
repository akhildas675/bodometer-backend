import { injectable } from "inversify";
import mongoose, { ClientSession } from "mongoose";

import { BaseRepository } from "@/modules/base/repository/base.repository";

import {
  ITrainerUnavailability,
  TrainerUnavailabilityModel,
} from "../model/trainer-unavailability.model";


import {
  CreateTrainerUnavailabilityData,
  ITrainerUnavailabilityRepository,
} from "../interface/repository.interface/trainer-unavailability-repository.interface";
import { TrainerUnavailability } from "../interface/domain/trainer-unavailability.interface";

@injectable()
export class TrainerUnavailabilityRepository
  extends BaseRepository<
    TrainerUnavailability,
    ITrainerUnavailability
  >
  implements ITrainerUnavailabilityRepository
{
  constructor() {
    super(TrainerUnavailabilityModel);
  }

  protected toInterface(
    doc: ITrainerUnavailability,
  ): TrainerUnavailability {
    return {
      id:
        doc._id.toString(),

      trainerId:
        doc.trainerId.toString(),

      type:
        doc.type,

      startDate:
        doc.startDate,

      endDate:
        doc.endDate,

      reason:
        doc.reason,

      status:
        doc.status,

      createdAt:
        doc.createdAt,

      updatedAt:
        doc.updatedAt,
    };
  }

  async createMany(
    data: CreateTrainerUnavailabilityData[],
    session?: ClientSession,
  ): Promise<TrainerUnavailability[]> {

    if (data.length === 0) {
      return [];
    }

    const documents = data.map((item) => ({
      trainerId:
        new mongoose.Types.ObjectId(
          item.trainerId,
        ),

      type:
        item.type,

      startDate:
        item.startDate,

      endDate:
        item.endDate,

      reason:
        item.reason ?? "",

      status:
        item.status,
    }));

    const docs =
      await TrainerUnavailabilityModel.insertMany(
        documents,
        {
          session,
        },
      );

    return docs.map((doc) =>
      this.toInterface(doc),
    );
  }

  async getByTrainerId(
    trainerId: string
  ): Promise<TrainerUnavailability[]> {
    const docs = await TrainerUnavailabilityModel.find({
      trainerId: new mongoose.Types.ObjectId(trainerId),
    }).exec();

    return docs.map((doc) => this.toInterface(doc));
  }

  async createOne(
    data: CreateTrainerUnavailabilityData,
    session?: ClientSession
  ): Promise<TrainerUnavailability> {
    const doc = new TrainerUnavailabilityModel({
      trainerId: new mongoose.Types.ObjectId(data.trainerId),
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason ?? "",
      status: data.status || "ACTIVE",
    });
    await doc.save({ session });
    return this.toInterface(doc);
  }

  async findById(id: string): Promise<TrainerUnavailability | null> {
    const doc = await TrainerUnavailabilityModel.findById(id).exec();
    return doc ? this.toInterface(doc) : null;
  }

  async updateById(
    id: string,
    data: Partial<ITrainerUnavailability>,
    session?: ClientSession
  ): Promise<TrainerUnavailability | null> {
    const doc = await TrainerUnavailabilityModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true, session }
    ).exec();
    return doc ? this.toInterface(doc) : null;
  }

  async deleteById(id: string, session?: ClientSession): Promise<boolean> {
    const res = await TrainerUnavailabilityModel.findByIdAndDelete(id, { session }).exec();
    return !!res;
  }
}