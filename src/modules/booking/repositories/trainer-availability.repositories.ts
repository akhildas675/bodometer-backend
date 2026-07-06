import { BaseRepository } from '@/modules/base/repository/base.repository';
import { injectable } from "inversify";
import {
  ITrainerAvailability,
  TrainerAvailabilityModel,
} from "../models/trainer-availability.model";
import {
  AvailabilityCreate,
  TrainerAvailability,
} from "../interface/booking.interface";
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
    data: AvailabilityCreate,
  ): Promise<TrainerAvailability> {
    return this.create(data);
  }
}
