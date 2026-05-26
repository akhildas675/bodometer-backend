"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_config_1 = __importDefault(require("./config/logger.config"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes/routes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const errorHandling_1 = require("./middleware/errorHandling");
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use("/api/user/stripe/webhook", express_1.default.raw({ type: "application/json" }));
app.use(express_1.default.json());
//routes
(0, routes_1.default)(app);
app.use(errorHandling_1.errorHandler);
process.on("uncaughtException", (error) => {
    logger_config_1.default.fatal({ error }, "Uncaught Exception");
    process.exit(1);
});
process.on("unhandledRejection", (reason) => {
    logger_config_1.default.fatal({ reason }, "Unhandled Rejection");
    process.exit(1);
});
exports.default = app;
