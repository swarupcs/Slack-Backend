/**
 * Standard API success response structure.
 */
export interface IApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  statusCode: number;
}

/**
 * Standard API error response structure.
 */
export interface IApiErrorResponse {
  success: false;
  message: string;
  errors: string[];
  statusCode: number;
  stack?: string;
}

/**
 * Union type for all API responses.
 */
export type ApiResponseType<T = unknown> =
  | IApiSuccessResponse<T>
  | IApiErrorResponse;
