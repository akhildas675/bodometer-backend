"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_routes_1 = __importDefault(require("./auth/auth.routes"));
const admin_routes_1 = __importDefault(require("./admin/admin.routes"));
const user_routes_1 = __importDefault(require("./user/user.routes"));
const trainer_route_1 = __importDefault(require("./trainer/trainer.route"));
const combined_routes_constant_1 = require("../constants/routes.constant/combined.routes.constant");
const routes = (app) => {
    app.use(combined_routes_constant_1.API_ROUTES.BASE, auth_routes_1.default);
    app.use(combined_routes_constant_1.API_ROUTES.BASE, user_routes_1.default);
    app.use(combined_routes_constant_1.API_ROUTES.BASE, trainer_route_1.default);
    app.use(combined_routes_constant_1.API_ROUTES.BASE, admin_routes_1.default);
    //admin sub routes
};
exports.default = routes;
