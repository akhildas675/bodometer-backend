import express from "express";
import logger from "./config/logger.config";
import cors from 'cors'
import routes from "./routes/routes";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandling";

const app = express();

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, origin);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  "/api/user/stripe/webhook",
  express.raw({ type: "application/json" }),
);

app.use(express.json());

//routes
routes(app);
app.use(errorHandler)


process.on("uncaughtException", (error: Error) => {
  logger.fatal({ error }, "Uncaught Exception");
  process.exit(1);
});

process.on("unhandledRejection", (reason: unknown) => {
  logger.fatal({ reason }, "Unhandled Rejection");
  process.exit(1);
});

export default app;