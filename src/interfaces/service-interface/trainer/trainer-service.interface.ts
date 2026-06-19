import { CategoryQuery, GetAllCategoriesResponse } from "../../../modules/category/interface/category.interface";
import { FindTrainerResponseDto, TrainerProfileDto, TrainerStatusResponseDto, UpdateTrainerProfileDto } from "../../../dto/trainer/trainer.dto";
import { CreateAvailabilityDto, UpdateAvailabilityDto, GetBookingsQueryDto, GetAvailabilitiesQueryDto } from "../../../dto/trainer/trainer-booking.dto";
import { PopulatedTrainerBooking, TrainerAvailability } from "../../../interfaces/domain.interface/trainer-booking.interface";
import { PaginationMeta } from "../../../interfaces/domain.interface/common.interface";


export interface ITrainerService {
  fetchTrainer(trainerId: string): Promise<FindTrainerResponseDto>;
  updateTrainerProfile(trainerId: string, updateData: UpdateTrainerProfileDto): Promise<FindTrainerResponseDto>;
  uploadTrainerProfilePicture(trainerId: string, file: Express.Multer.File): Promise<string>;
  uploadTrainerDocument(file: Express.Multer.File): Promise<string>;
  createProfile(userId: string, data: TrainerProfileDto): Promise<void>;
  getTrainerStatus(userId: string): Promise<TrainerStatusResponseDto>;
  getCategories(query: CategoryQuery): Promise<GetAllCategoriesResponse>;

  // Trainer Availability
  createAvailability(trainerId: string, data: CreateAvailabilityDto): Promise<{ message: string; availability: TrainerAvailability }>;
  getAvailabilities(trainerId: string, query: GetAvailabilitiesQueryDto): Promise<{ data: TrainerAvailability[]; pagination: PaginationMeta }>;
  updateAvailabilityStatus(trainerId: string, availabilityId: string, data: UpdateAvailabilityDto): Promise<TrainerAvailability>;

  // Listing Bookings
  getTrainerBookings(trainerId: string, query: GetBookingsQueryDto): Promise<{ data: PopulatedTrainerBooking[]; pagination: PaginationMeta }>;

  // Booking Actions
  confirmBooking(trainerId: string, bookingId: string): Promise<PopulatedTrainerBooking>;
  rejectBooking(trainerId: string, bookingId: string, reason: string): Promise<PopulatedTrainerBooking>;
  completeBooking(trainerId: string, bookingId: string): Promise<PopulatedTrainerBooking>;
  cancelBookingByTrainer(trainerId: string, bookingId: string, reason?: string): Promise<PopulatedTrainerBooking>;
}