import { authGuard, optionalAuth } from "../../middleware/authGuard";


export const ROLE_GUARD={
    ADMIN_GUARD:authGuard(['admin']),
    USER_GUARD:authGuard(['user']),
    TRAINER_GUARD:authGuard(['trainer']),
    ALL_GUARDS:authGuard(["admin","trainer","user"]),
    USER_TRAINER_GUARD:authGuard(["trainer","user"]),
    OPTIONAL_AUTH: optionalAuth,
} as const