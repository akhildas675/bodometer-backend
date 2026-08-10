import { injectable } from "inversify";
import mongoose, { ClientSession } from "mongoose";

import { BaseRepository } from "@/modules/base/repository/base.repository";
import { ITrainerBookingSettings, TrainerBookingSettingsModel } from "../model/trainer.booking-settings.model";
import { TrainerBookingSettings } from "../interface/domain/trainer.booking-settings.interface";
import { CreateTrainerBookingSettingsData, ITrainerBookingSettingsRepository } from "../interface/repository.interface/trainer-booking.setting-repository.interface";



@injectable()
export class TrainerBookingSettingsRepository
  extends BaseRepository<
    TrainerBookingSettings,
    ITrainerBookingSettings
  >
  implements ITrainerBookingSettingsRepository
{
  constructor() {
    super(TrainerBookingSettingsModel);
  }


  protected toInterface(
    doc: ITrainerBookingSettings,
  ): TrainerBookingSettings {
    return {
      id: doc._id.toString(),

      trainerId: doc.trainerId.toString(),

      serviceIds: doc.serviceIds.map(
        (serviceId) => serviceId.toString(),
      ),

      advanceNoticeHours:
        doc.advanceNoticeHours,

      bufferMinutes:
        doc.bufferMinutes,

      maximumBookingPerDay:
        doc.maximumBookingPerDay,

      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async createBookingSettings(
    data: CreateTrainerBookingSettingsData,
    session?: ClientSession,
  ): Promise<TrainerBookingSettings> {

    const [doc] =
      await TrainerBookingSettingsModel.create(
        [
          {
            trainerId:
              new mongoose.Types.ObjectId(
                data.trainerId,
              ),

            serviceIds: data.serviceIds.map(
              (serviceId) =>
                new mongoose.Types.ObjectId(
                  serviceId,
                ),
            ),

            advanceNoticeHours:
              data.advanceNoticeHours,

            bufferMinutes:
              data.bufferMinutes,

            maximumBookingPerDay:
              data.maximumBookingPerDay,
          },
        ],
        { session },
      );

    return this.toInterface(doc);
  }

  async getByTrainerId(
    trainerId: string,
  ): Promise<TrainerBookingSettings | null> {

    const doc =
      await TrainerBookingSettingsModel
        .findOne({
          trainerId:
            new mongoose.Types.ObjectId(
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
    data: Partial<CreateTrainerBookingSettingsData>,
    session?: ClientSession,
  ): Promise<TrainerBookingSettings | null> {
    const doc = await TrainerBookingSettingsModel.findOneAndUpdate(
      { trainerId: new mongoose.Types.ObjectId(trainerId) },
      { $set: data },
      { new: true, runValidators: true, session }
    ).exec();

    return doc ? this.toInterface(doc) : null;
  }
}