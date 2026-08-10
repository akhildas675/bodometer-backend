import { TrainerAvailability } from "../interface/domain/trainer-availability.interface";
import { ITrainerAvailability } from "../model/trainer-availability.model";

export class TrainerAvailabilityMapper {
  static toDomain(
    doc: ITrainerAvailability
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
}