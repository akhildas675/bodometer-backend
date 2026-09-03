import dotenv from "dotenv";
dotenv.config();

import http from "http";

import app from "./app";
import { connectDB } from "./config/db";
import { AppError } from "./utils/appError";
import { MESSAGES } from "./constants/messages";
import logger from "./config/logger.config";
import { STATUS } from "./constants/constant.values.ts/statuscode";
import { initializeSocket } from "./infrastructure/socket/socket.server";

import container from "./container/container";
import type { ServiceIdentifier } from "inversify";

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