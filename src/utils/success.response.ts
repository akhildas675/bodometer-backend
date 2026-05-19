import { Response } from "express";

export class SuccessResponse<T> {
  public success = true;

  constructor(
    public statusCode: number,
    public message: string,
    public data?: T,
    public pagination?: unknown
  ) {}

  public send(res: Response): Response {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      ...(this.data !== undefined ? { data: this.data } : {}),
      ...(this.pagination !== undefined ? { pagination: this.pagination } : {}),
    });
  }
}