import { injectable } from "inversify";
import mongoose, { ClientSession } from "mongoose";

import { BaseRepository } from "@/modules/base/repository/base.repository";

import {
  ITrainerAvailability,
  TrainerAvailabilityModel,
} from "../model/trainer-availability.model";
import { TrainerAvailability } from "../interface/domain/trainer-availability.interface";
import { CreateTrainerAvailabilityData, ITrainerAvailabilityRepository, UpdateTrainerAvailabilityData } from "../interface/repository.interface/trainer.availability-repository.interface";



@injectable()
export class TrainerAvailabilityRepository
  extends BaseRepository<
    TrainerAvailability,
    ITrainerAvailability
  >
  implements ITrainerAvailabilityRepository
{
  constructor() {
    super(TrainerAvailabilityModel);
  }
 

  protected toInterface(
    doc: ITrainerAvailability,
  ): TrainerAvailability {
    return {
      id: doc._id.toString(),

      trainerId: doc.trainerId.toString(),

      effectiveFrom: doc.effectiveFrom,
      effectiveUntil: doc.effectiveUntil,

      timeZone: doc.timeZone,

      weeklySchedule: doc.weeklySchedule.map((day) => ({
        dayOfWeek: day.dayOfWeek,

        isAvailable: day.isAvailable,

        shifts: day.shifts.map((shift) => ({
          startMinute: shift.startMinute,
          endMinute: shift.endMinute,
        })),
      })),

      status: doc.status,

      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async createAvailability(
    data: CreateTrainerAvailabilityData,
    session?: ClientSession,
  ): Promise<TrainerAvailability> {

    const [doc] = await this.model.create(
      [
        {
          trainerId: new mongoose.Types.ObjectId(
            data.trainerId,
          ),

          effectiveFrom: data.effectiveFrom,
          effectiveUntil: data.effectiveUntil,

          timeZone: data.timeZone,

          weeklySchedule: data.weeklySchedule,

          status: data.status,
        },
      ],
      { session },
    );

    return this.toInterface(doc);
  }

  async getByTrainerId(
    trainerId: string,
  ): Promise<TrainerAvailability | null> {

    const doc = await this.model
      .findOne({
        trainerId: new mongoose.Types.ObjectId(
          trainerId,
        ),
      })
      .exec();

    return doc
      ? this.toInterface(doc)
      : null;
  }


  async updateByTrainerId(
  trainerId: string,
  data: UpdateTrainerAvailabilityData,
  session?: ClientSession,
): Promise<TrainerAvailability | null> {

  const doc = await TrainerAvailabilityModel
    .findOneAndUpdate(
      {
        trainerId: new mongoose.Types.ObjectId(trainerId),
      },
      {
        $set: {
          effectiveFrom: data.effectiveFrom,
          effectiveUntil: data.effectiveUntil,
          timeZone: data.timeZone,
          weeklySchedule: data.weeklySchedule,
          status: data.status,
        },
      },
      {
        new: true,
        runValidators: true,
        session,
      },
    )
    .exec();

  return doc
    ? this.toInterface(doc)
    : null;
}


}