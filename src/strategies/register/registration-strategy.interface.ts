export interface IRegistrationStrategy {
  getOtpPurpose(): string;
  validateRole(): void;
}