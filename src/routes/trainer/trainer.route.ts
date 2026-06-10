import { Router } from "express";
import { TRAINER_ROUTES } from "../../constants/routes.constant/trainer-routes.constant";
import { ROLE_GUARD } from "../../constants/role.guard";
import { createTrainerModule } from "../../modules/trainer/trainer.module";
import { mediaUpload } from "../../config/multer";
import { validate } from "@/middleware/validate";
import {
  createTrainerProfileSchema,
  updateTrainerProfileSchema,
  uploadProfilePictureSchema,
  uploadTrainerDocumentSchema,
  createAvailabilitySchema,
  getAvailabilitiesSchema,
  updateAvailabilitySchema,
  trainerGetBookingsSchema,
  trainerBookingActionSchema,
} from "@/validators/trainer/trainer.validator";

const trainerRoute = Router();

const { trainerController } = createTrainerModule();

trainerRoute.post(
  TRAINER_ROUTES.SUBMIT_PROFILE_DATA,
  ROLE_GUARD.TRAINER_GUARD,
  mediaUpload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "certificate", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  validate(createTrainerProfileSchema),
  trainerController.createProfile,
);

trainerRoute.get(
  TRAINER_ROUTES.GET_TRAINER_PROFILE,
  ROLE_GUARD.TRAINER_GUARD,
  trainerController.getTrainer,
);

trainerRoute.put(
  TRAINER_ROUTES.TRAINER_PROFILE_UPDATE,
  ROLE_GUARD.TRAINER_GUARD,
  validate(updateTrainerProfileSchema),
  trainerController.updateProfile,
);

trainerRoute.post(
  TRAINER_ROUTES.TRAINER_PROFILE_PICTURE_UPDATE,
  ROLE_GUARD.TRAINER_GUARD,
  mediaUpload.single("file"),
  validate(uploadProfilePictureSchema),
  trainerController.uploadProfilePicture,
);

trainerRoute.post(
  TRAINER_ROUTES.UPLOAD_DOCUMENT,
  ROLE_GUARD.TRAINER_GUARD,
  mediaUpload.single("file"),
  validate(uploadTrainerDocumentSchema),
  trainerController.uploadDocument,
);

trainerRoute.get(
  TRAINER_ROUTES.GET_PROFILE_STATUS,
  ROLE_GUARD.TRAINER_GUARD,
  trainerController.getProfileStatus,
);
trainerRoute.get(
  TRAINER_ROUTES.GET_CATEGORIES,
  ROLE_GUARD.TRAINER_GUARD,
  trainerController.getCategories,
);

// Availability
trainerRoute.post(
  "/trainer/availability",
  validate(createAvailabilitySchema),
  ROLE_GUARD.TRAINER_GUARD,
  trainerController.createAvailability
);

trainerRoute.get(
  "/trainer/availability",
  validate(getAvailabilitiesSchema),
  ROLE_GUARD.TRAINER_GUARD,
  trainerController.getAvailabilities
);

trainerRoute.patch(
  "/trainer/availability/:availabilityId/status",
  validate(updateAvailabilitySchema),
  ROLE_GUARD.TRAINER_GUARD,
  trainerController.updateAvailabilityStatus
);

// Bookings
trainerRoute.get(
  TRAINER_ROUTES.GET_MY_BOOKINGS,
  validate(trainerGetBookingsSchema),
  ROLE_GUARD.TRAINER_GUARD,
  trainerController.getMyBookings
);

trainerRoute.patch(
  TRAINER_ROUTES.CONFIRM_BOOKING,
  validate(trainerBookingActionSchema),
  ROLE_GUARD.TRAINER_GUARD,
  trainerController.confirmBooking
);

trainerRoute.patch(
  TRAINER_ROUTES.REJECT_BOOKING,
  validate(trainerBookingActionSchema),
  ROLE_GUARD.TRAINER_GUARD,
  trainerController.rejectBooking
);

trainerRoute.patch(
  TRAINER_ROUTES.COMPLETE_BOOKING,
  validate(trainerBookingActionSchema),
  ROLE_GUARD.TRAINER_GUARD,
  trainerController.completeBooking
);

trainerRoute.patch(
  TRAINER_ROUTES.CANCEL_BOOKING,
  validate(trainerBookingActionSchema),
  ROLE_GUARD.TRAINER_GUARD,
  trainerController.cancelBooking
);

export default trainerRoute;
