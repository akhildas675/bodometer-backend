import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/db";
import { connectRedis } from "./config/redis";
import { AppError } from "./utils/appError";
import { STATUS } from "./constants/statuscode";
import logger from "./config/logger.config";

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new AppError(STATUS.BAD_REQUEST, "mongo uri error");
}

const mongoUri: string = MONGO_URI;

async function start() {
  try {
    await connectDB(mongoUri);

    connectRedis();

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`)
    });
  } catch (err) {
    console.error("Server failed to start:", err);
    process.exit(1);
  }
}

start();
