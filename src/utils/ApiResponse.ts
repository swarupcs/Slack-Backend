import type { IApiSuccessResponse } from '../types/api.types';

/**
 * Standardized API success response.
 *
 * @example
 * ```ts
 * return res.status(200).json(new ApiResponse(200, user, 'User fetched'));
 * ```
 */
export class ApiResponse<T = unknown> implements IApiSuccessResponse<T> {
  public readonly success = true as const;
  public readonly statusCode: number;
  public readonly message: string;
  public readonly data: T;

  constructor(statusCode: number, data: T, message = 'Success') {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
