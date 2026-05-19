export interface ErrorDetail {
  field?: string;
  message: string;
}
export class AppError extends Error {
  public statusCode: number;
  public errors?: ErrorDetail[];

  constructor(statusCode: number, message: string, errors?: ErrorDetail[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
