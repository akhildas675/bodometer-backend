export const MESSAGES = {


    REGISTER: {
        SUCCESS: "User registered successfully.",
        OTP_SENT: "OTP has been sent to your email.",
        EMAIL_EXISTS: "Email already registered.",
        PHONE_EXISTS: "Phone number already registered.",
        USERNAME_EXISTS: "Username already taken.",
        WEAK_PASSWORD: "Password does not meet security requirements.",
        PASSWORD_MISMATCH: "Password and confirm password do not match.",
        INVALID_EMAIL_FORMAT: "Invalid email address format.",
        EMAIL_NOT_ALLOWED: "Registration with this email domain is not allowed.",
        MINIMUM_AGE_REQUIRED: "You must meet the minimum age requirement.",
        TOO_MANY_ATTEMPTS: "Too many registration attempts. Try again later.",
        ACCOUNT_PENDING_VERIFICATION: "Account exists but email verification is pending.",
        
    },


    LOGIN: {
        SUCCESS: "Login successful.",
        LOGOUT_SUCCESS: "Logout successful.",
        INVALID_CREDENTIALS: "Invalid email or password.",
        USER_NOT_FOUND: "Account not found.",
        WRONG_PASSWORD: "Incorrect password.",
        ACCOUNT_BLOCKED: "Your account has been blocked.",
        ACCOUNT_DISABLED: "Your account has been disabled by admin.",
        EMAIL_NOT_VERIFIED: "Please verify your email before logging in.",
        TOO_MANY_FAILED_ATTEMPTS: "Too many failed login attempts. Try again later.",
        RATE_LIMIT_EXCEEDED: "Too many login attempts. Please wait before retrying.",
        PASSWORD_RECENTLY_CHANGED: "Your password was recently changed. Please re-login.",
        EMAIL_AND_PASSWORD_REQUIRED:"Email and password required"
    },


    TOKEN: {
        CREATED: "Token generated successfully.",
        REFRESH_SUCCESS: "Refresh token issued successfully.",
        MISSING: "Authorization token required.",
        INVALID: "Invalid or tampered token.",
        EXPIRED: "Token has expired.",
        REFRESH_TOKEN_EXPIRED: "Session expired. Please login again.",
        REFRESH_TOKEN_INVALID: "Invalid refresh token.",
        TOKEN_REVOKED: "Session has been revoked.",
        SIGNATURE_INVALID: "Token signature invalid.",
    },

};
