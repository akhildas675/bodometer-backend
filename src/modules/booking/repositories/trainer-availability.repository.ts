import { BaseRepository } from '@/modules/base/repository/base.repository';
import { injectable } from "inversify";
import {
  ITrainerAvailability,
  TrainerAvailabilityModel,
} from "../models/trainer-availability.model";
import {
  AvailabilityCreate,
  TrainerAvailability,
} from "../interface/trainer-availability.interface";
import { ITrainerAvailabilityRepository } from "../interface/trainer.availability-repository.interface";

@injectable()
export default class TrainerAvailabilityRepository
  extends BaseRepository<TrainerAvailability, ITrainerAvailability>
  implements ITrainerAvailabilityRepository
{
  constructor() {
    super(TrainerAvailabilityModel);
  }

  protected toInterface(doc: ITrainerAvailability): TrainerAvailability {
    return {
      id:doc._id.toString(),
      trainerId: doc.trainerId.toString(),
      availability: doc.availability.map((a) => ({
        date: a.date,
        shifts: a.shifts.map((s) => ({
          startTime: s.startTime,
          endTime: s.endTime,
          duration: s.duration,
        })),
      })),
    };
  }

  async createAvailability(
    data: AvailabilityCreate
  ): Promise<TrainerAvailability> {
    return this.create(data);
  }

  async updateAvailability(
    id: string,
    data: TrainerAvailability
  ): Promise<TrainerAvailability> {
    const existing = await this.model.findById(id);
    if (!existing) {
      throw new Error("Availability not found");
    }

    existing.availability = data.availability.map((a) => ({
      date: new Date(a.date),
      shifts: a.shifts.map((s) => ({
        startTime: new Date(s.startTime),
        endTime: new Date(s.endTime),
        duration: s.duration,
      })),
    }));

    await existing.save();

    return this.toInterface(existing);
  }

  async findAvailabilityById(availabilityId:string):Promise<TrainerAvailability | null>{
    return this.findById(availabilityId)
  }

  async findByTrainerId(trainerId: string): Promise<TrainerAvailability | null> {
    return this.findOne({trainerId})
  }
}
