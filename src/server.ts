import dotenv from "dotenv";
dotenv.config();

import http from "http";

import app from "./app";
import { connectDB } from "./config/db";
import { connectRedis } from "./config/redis";
import { AppError } from "./utils/appError";
import { MESSAGES } from "./constants/messages";
import logger from "./config/logger.config";
import { STATUS } from "./constants/constant.values.ts/statuscode";
import { initializeSocket } from "./infrastructure/socket/socket.server";
import container from "./container/container";
import { BOOKING_TYPES } from "./modules/booking/booking.types";
import { IBookingService } from "./modules/booking/interface/service.interface/booking-service.interface";

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new AppError(
    STATUS.BAD_REQUEST,
    MESSAGES.COMMON.MONGO_URI_ERROR,
  );
}

const mongoUri: string = MONGO_URI;

async function start() {
  try {
    await connectDB(mongoUri);

    connectRedis();

    // Expire stale PENDING_PAYMENT bookings every minute so unpaid holds release capacity
    const bookingService = container.get<IBookingService>(BOOKING_TYPES.BookingService);
    const expiryTimer = setInterval(() => {
      bookingService.expireStalePendingBookings().catch((err) => {
        logger.error({ err }, "Booking expiry job failed");
      });
    }, 60 * 1000);
    expiryTimer.unref();

    const httpServer = http.createServer(app);

    initializeSocket(httpServer);

    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (err: unknown) {
    console.error("Server failed to start:", err);
    process.exit(1);
  }
}

void start();