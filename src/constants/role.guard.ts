import { authGuard } from "../middleware/authGuard";


export const ROLE_GUARD={
    ADMIN_GUARD:authGuard(['admin']),
    USER_GUARD:authGuard(['user']),
    TRAINER_GUARD:authGuard(['trainer']),
} as const