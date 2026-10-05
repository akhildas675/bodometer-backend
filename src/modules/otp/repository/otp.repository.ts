import { injectable } from "inversify";

import { BaseRepository } from "@/modules/base/repository/base.repository";

import { OtpPurpose } from "@/constants/constant.values.ts/otp.constants";

import {
  Otp,
  UpdateOtpData,
} from "../interface/otp.interface";

import {
  IOtp,
  OtpModel,
} from "../model/otp.model";

import { IOtpRepository } from "../interface/otp-repository.interface";

@injectable()
export class OtpRepository
  extends BaseRepository<Otp, IOtp>
  implements IOtpRepository
{
  constructor() {
    super(OtpModel);
  }

  protected toInterface(doc: IOtp): Otp {
    return {
      id: doc._id.toString(),

      email: doc.email,

      purpose: doc.purpose,

      otp: doc.otp,

      attempts: doc.attempts,

      isVerified: doc.isVerified,

      otpExpiresAt: doc.otpExpiresAt,

      resendCount: doc.resendCount,

      resendWindowStartedAt: doc.resendWindowStartedAt,

      resendWindowExpiresAt: doc.resendWindowExpiresAt,

      createdAt: doc.createdAt,
    };
  }

  async findByEmailAndPurpose(
    email: string,
    purpose: OtpPurpose,
  ): Promise<Otp | null> {
    return this.findOne({
      email,
      purpose,
    });
  }

  async updateOtp(
    id: string,
    data: Partial<UpdateOtpData>,
  ): Promise<Otp | null> {
    return this.updateById(id, {
      $set: data,
    });
  }

  async incrementResendCount(
    id: string,
  ): Promise<Otp | null> {
    return this.updateById(id, {
      $inc: {
        resendCount: 1,
      },
    });
  }
}