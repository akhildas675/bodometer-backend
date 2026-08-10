import { Container } from "inversify";
import { BOOKING_TYPES } from "./booking.types";

import { ITrainerAvailabilityRepository } from "./interface/repository.interface/trainer.availability-repository.interface";
import { ITrainerBookingSettingsRepository } from "./interface/repository.interface/trainer-booking.setting-repository.interface";
import { ITrainerUnavailabilityRepository } from "./interface/repository.interface/trainer-unavailability-repository.interface";
import { ITrainerAvailabilityOverrideRepository } from "./interface/repository.interface/trainer-availability-override-repository.interface";
import { IBookingRepository } from "./interface/repository.interface/booking-repository.interface";
import { IBookingAuditLogRepository } from "./interface/repository.interface/booking-audit-log-repository.interface";
import { IBookingCancellationRepository, BookingCancellationRepository } from "./repositories/booking-cancellation.repository";
import { IBookingRescheduleRequestRepository, BookingRescheduleRequestRepository } from "./repositories/booking-reschedule-request.repository";
import { IBookingRefundRepository, BookingRefundRepository } from "./repositories/booking-refund.repository";

import { ITrainerSchedulingService } from "./interface/service.interface/trainer-scheduling-service.interface";
import { IBookingSlotEngineService } from "./interface/service.interface/booking-slot-engine-service.interface";
import { IBookingService } from "./interface/service.interface/booking-service.interface";
import { IBookingCancellationService } from "./interface/service.interface/booking-cancellation-service.interface";
import { IBookingRescheduleService } from "./interface/service.interface/booking-reschedule-service.interface";
import { IBookingRefundService } from "./interface/service.interface/booking-refund-service.interface";

import { TrainerAvailabilityRepository } from "./repositories/trainer-availability.repository";
import { TrainerBookingSettingsRepository } from "./repositories/trainer.booking-setting.repository";
import { TrainerUnavailabilityRepository } from "./repositories/trainer-unavailability.repository";
import { TrainerAvailabilityOverrideRepository } from "./repositories/trainer-availability-override.repository";
import { BookingRepository } from "./repositories/booking.repository";
import { BookingAuditLogRepository } from "./repositories/booking-audit-log.repository";

import { TrainerSchedulingService } from "./services/trainer-scheduling.service";
import { BookingSlotEngineService } from "./services/booking-slot-engine.service";
import { BookingService } from "./services/booking.service";
import { BookingCancellationService } from "./services/booking-cancellation.service";
import { BookingRescheduleService } from "./services/booking-reschedule.service";
import { BookingRefundService } from "./services/booking-refund.service";

import { TrainerSchedulingController } from "./controller/trainer-scheduling.controller";
import { BookingCancellationController } from "./controller/booking-cancellation.controller";
import { BookingRescheduleController } from "./controller/booking-reschedule.controller";
import { BookingSlotController } from "./controller/booking-slot.controller";

export const loadBookingBindings = (container: Container) => {
  // Repositories
  container
    .bind<ITrainerAvailabilityRepository>(BOOKING_TYPES.TrainerAvailabilityRepository)
    .to(TrainerAvailabilityRepository);

  container
    .bind<ITrainerBookingSettingsRepository>(BOOKING_TYPES.TrainerBookingSettingsRepository)
    .to(TrainerBookingSettingsRepository);

  container
    .bind<ITrainerUnavailabilityRepository>(BOOKING_TYPES.TrainerUnavailabilityRepository)
    .to(TrainerUnavailabilityRepository);

  container
    .bind<ITrainerAvailabilityOverrideRepository>(BOOKING_TYPES.TrainerAvailabilityOverrideRepository)
    .to(TrainerAvailabilityOverrideRepository);

  container
    .bind<IBookingRepository>(BOOKING_TYPES.BookingRepository)
    .to(BookingRepository);

  container
    .bind<IBookingAuditLogRepository>(BOOKING_TYPES.BookingAuditLogRepository)
    .to(BookingAuditLogRepository);

  container
    .bind<IBookingCancellationRepository>(BOOKING_TYPES.BookingCancellationRepository)
    .to(BookingCancellationRepository);

  container
    .bind<IBookingRescheduleRequestRepository>(BOOKING_TYPES.BookingRescheduleRequestRepository)
    .to(BookingRescheduleRequestRepository);

  container
    .bind<IBookingRefundRepository>(BOOKING_TYPES.BookingRefundRepository)
    .to(BookingRefundRepository);

  // Services
  container
    .bind<ITrainerSchedulingService>(BOOKING_TYPES.TrainerSchedulingService)
    .to(TrainerSchedulingService);

  container
    .bind<IBookingSlotEngineService>(BOOKING_TYPES.BookingSlotEngineService)
    .to(BookingSlotEngineService);

  container
    .bind<IBookingService>(BOOKING_TYPES.BookingService)
    .to(BookingService);

  container
    .bind<IBookingCancellationService>(BOOKING_TYPES.BookingCancellationService)
    .to(BookingCancellationService);

  container
    .bind<IBookingRescheduleService>(BOOKING_TYPES.BookingRescheduleService)
    .to(BookingRescheduleService);

  container
    .bind<IBookingRefundService>(BOOKING_TYPES.BookingRefundService)
    .to(BookingRefundService);

  // Controllers
  container
    .bind<TrainerSchedulingController>(BOOKING_TYPES.TrainerSchedulingController)
    .to(TrainerSchedulingController);

  container
    .bind<BookingCancellationController>(BOOKING_TYPES.BookingCancellationController)
    .to(BookingCancellationController);

  container
    .bind<BookingRescheduleController>(BOOKING_TYPES.BookingRescheduleController)
    .to(BookingRescheduleController);

  container
    .bind<BookingSlotController>(BOOKING_TYPES.BookingSlotController)
    .to(BookingSlotController);
};