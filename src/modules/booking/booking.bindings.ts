import { Container } from "inversify";
import { ITrainerAvailabilityRepository } from "./interface/trainer.availability-repository.interface";
import { BOOKING_TYPES } from "./booking.types";
import TrainerAvailabilityRepository from "./repositories/trainer-availability.repositories";
import { IBookingService } from "./interface/booking-service.interface";
import BookingService from "./service/booking.service";
import { BookingController } from "./controller/booking.controller";

export const loadBookingBindings=(
    container:Container
)=>{
    container.bind<ITrainerAvailabilityRepository>(BOOKING_TYPES.TrainerAvailabilityRepository)
    .to(TrainerAvailabilityRepository);

    container.bind<IBookingService>(BOOKING_TYPES.BookingService)
    .to(BookingService);
    container.bind(BookingController)
}