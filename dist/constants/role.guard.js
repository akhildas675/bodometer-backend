"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_GUARD = void 0;
const authGuard_1 = require("../middleware/authGuard");
exports.ROLE_GUARD = {
    ADMIN_GUARD: (0, authGuard_1.authGuard)(['admin']),
    USER_GUARD: (0, authGuard_1.authGuard)(['user']),
    TRAINER_GUARD: (0, authGuard_1.authGuard)(['trainer']),
};
