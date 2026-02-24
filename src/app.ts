import express from "express";
import logger from "./config/logger.config";
import { httpLogger } from "./middleware/logger.middleware";
import cors from 'cors'
import routes from "./routes/routes";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandling";

const app = express();


// app.use(httpLogger);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(cookieParser());

//routes
routes(app);
app.use(errorHandler)


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});


process.on("uncaughtException", (error: Error) => {
  logger.fatal({ error }, "Uncaught Exception");
  process.exit(1);
});

process.on("unhandledRejection", (reason: unknown) => {
  logger.fatal({ reason }, "Unhandled Rejection");
  process.exit(1);
});

export default app;