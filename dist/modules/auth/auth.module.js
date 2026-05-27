"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthModule = createAuthModule;
const auth_controller_1 = require("../../controllers/auth/auth.controller");
const trainer_profile_repository_1 = __importDefault(require("../../repositories/trainer-profile.repository"));
const user_repository_1 = __importDefault(require("../../repositories/user.repository"));
const user_subscription_repository_1 = require("../../repositories/user-subscription.repository");
const answer_repository_1 = __importDefault(require("../../repositories/answer.repository"));
const auth_services_1 = require("../../services/auth/auth.services");
const mail_services_1 = require("../../services/auth/otp/mail.services");
const otp_services_1 = require("../../services/auth/otp/otp.services");
const session_services_1 = require("../../services/auth/session/session.services");
function createAuthModule() {
    const mailService = new mail_services_1.MailService();
    const otpService = new otp_services_1.OtpService(mailService);
    const sessionService = new session_services_1.SessionService();
    const userRepository = new user_repository_1.default();
    const trainerProfileRepository = new trainer_profile_repository_1.default();
    const userSubscriptionRepository = new user_subscription_repository_1.UserSubscriptionRepository();
    const answerRepository = new answer_repository_1.default();
    const authService = new auth_services_1.AuthService(userRepository, otpService, sessionService, trainerProfileRepository, userSubscriptionRepository, answerRepository);
    const authController = new auth_controller_1.AuthController(authService);
    return { authController };
}
