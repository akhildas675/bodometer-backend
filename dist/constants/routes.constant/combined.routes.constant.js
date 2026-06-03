"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_ROUTES = void 0;
const admin_routes_constant_1 = require("./admin-routes.constant");
const auth_routes_constant_1 = require("./auth-routes.constant");
const trainer_routes_constant_1 = require("./trainer-routes.constant");
const user_routes_constant_1 = require("./user-routes.constant");
exports.API_ROUTES = {
    BASE: '/api',
    AUTH: auth_routes_constant_1.AUTH_ROUTES,
    ADMIN: admin_routes_constant_1.ADMIN_ROUTES,
    USER: user_routes_constant_1.USER_ROUTES,
    TRAINER: trainer_routes_constant_1.TRAINER_ROUTES,
};
