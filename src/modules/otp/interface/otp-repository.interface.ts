import { OtpPurpose } from "@/constants/constant.values.ts/otp.constants";
import { Otp, UpdateOtpData } from "./otp.interface";
import { IOtp } from "../model/otp.model";

export interface IOtpRepository{
  findByEmailAndPurpose(email:string,purpose:OtpPurpose):Promise<Otp |null>;
  create(
    data: Partial<IOtp>,
  ): Promise<Otp>;
  updateOtp(id:string,data:Partial<UpdateOtpData>):Promise<Otp | null>;
  incrementResendCount(id:string):Promise<Otp | null>
  deleteById(id:string):Promise<boolean>
} 