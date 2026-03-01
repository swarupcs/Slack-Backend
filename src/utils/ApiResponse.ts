import { Response } from 'express';

/**
 * Structured API success response.
 * Controllers call `.send(res)` instead of calling res.json() directly,
 * ensuring every success response has the same shape.
 */
class ApiResponse<T = unknown> {
  public readonly statusCode: number;
  public readonly data: T;
  public readonly message: string;
  public readonly success: boolean;

  constructor(statusCode: number, data: T, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    // success is true for 2xx status codes
    this.success = statusCode >= 200 && statusCode < 300;
  }

  send(res: Response): Response {
    return res.status(this.statusCode).json({
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data
    });
  }
}

export { ApiResponse };
