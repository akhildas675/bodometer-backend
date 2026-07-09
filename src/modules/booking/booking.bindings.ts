import { Container } from "inversify";
import { BOOKING_TYPES } from "./booking.types";
import { ITrainerAvailabilityRepository } from "./interface/trainer.availability-repository.interface";
import { ITrainerAvailabilityService } from "./interface/trainer-availability-service.interface";
import { ITrainerSlotRepository } from "./interface/trainer.slot-repository.interface";
import { ITrainerSlotService } from "./interface/trainer.slot-service.interface";
import { IBookingRepository } from "./interface/booking-repository.interface";
import { IBookingService } from "./interface/booking-service.interface";


import TrainerAvailabilityRepository from "./repositories/trainer-availability.repository";
import TrainerSlotRepository from "./repositories/trainer-slot.repository";
import BookingRepository from "./repositories/booking.repository";


import TrainerAvailabilityService from "./service/trainer-availability.service";
import { TrainerSlotService } from "./service/trainer-slot.service";
import { BookingService } from "./service/booking.service";


import { TrainerAvailabilityValidation } from "./validation/trainer-availability.validation";
import { BookingValidation } from "./validation/booking.validation";

import { TrainerAvailabilityController } from "./controller/trainer-availability.controller";
import { TrainerSlotController } from "./controller/trainer-slot.controller";
import { BookingController } from "./controller/booking.controller";

export const loadBookingBindings = (container: Container): void => {
  // repositories 
  container
    .bind<ITrainerAvailabilityRepository>(BOOKING_TYPES.TrainerAvailabilityRepository)
    .to(TrainerAvailabilityRepository);

  container
    .bind<ITrainerSlotRepository>(BOOKING_TYPES.TrainerSlotRepository)
    .to(TrainerSlotRepository);

  container
    .bind<IBookingRepository>(BOOKING_TYPES.BookingRepository)
    .to(BookingRepository);

  // service
  container
    .bind<ITrainerAvailabilityService>(BOOKING_TYPES.TrainerAvailabilityService)
    .to(TrainerAvailabilityService);

  container
    .bind<ITrainerSlotService>(BOOKING_TYPES.TrainerSlotService)
    .to(TrainerSlotService);

  container
    .bind<IBookingService>(BOOKING_TYPES.BookingService)
    .to(BookingService);

  // Validation 
  container
    .bind(BOOKING_TYPES.TrainerAvailabilityValidation)
    .to(TrainerAvailabilityValidation);

  container
    .bind(BOOKING_TYPES.BookingValidation)
    .to(BookingValidation);

  // Controllers 
  container
    .bind(BOOKING_TYPES.TrainerAvailabilityController)
    .to(TrainerAvailabilityController);

  container
    .bind(BOOKING_TYPES.TrainerSlotController)
    .to(TrainerSlotController);

  container
    .bind(BOOKING_TYPES.BookingController)
    .to(BookingController);
};
