import { bodometerEmailLayout } from "../mail.service/emai.templete";


export const otpEmailTemplate = (otp: string): string => {
  return bodometerEmailLayout({
    title: "Verify your Bodometer account",
    preheader: "Your Bodometer verification code",
    content: `
      <h1 class="title">
        Verify your account
      </h1>

      <p class="text text-center">
        Use the verification code below to continue
        with your Bodometer account.
      </p>

      <div class="otp-container">

        <p class="otp-label">
          Verification Code
        </p>

        <p class="otp">
          ${otp}
        </p>

      </div>

      <p class="text text-center">
        This code is valid for a limited time.
        Please do not share this code with anyone.
      </p>

      <div class="notice">

        <p class="notice-text">
          If you did not request this verification code,
          you can safely ignore this email. Your account
          remains secure.
        </p>

      </div>

      <p class="security-text">
        For your security, Bodometer will never ask you
        to share your verification code by phone, email,
        or message.
      </p>
    `,
  });
};