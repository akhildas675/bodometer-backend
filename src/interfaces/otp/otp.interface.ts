import { OtpPurpose } from "../../constants/otp.constants";

export interface OtpVerify{
  email:string;
  otp:string;
  purpose:OtpPurpose
}


