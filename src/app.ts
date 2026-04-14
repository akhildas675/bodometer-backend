import express from "express";
import logger from "./config/logger.config";
import cors from 'cors'
import routes from "./routes/routes";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandling";

const app = express();

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


app.use(
  cors({
    origin: "http://localhost:5173",
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