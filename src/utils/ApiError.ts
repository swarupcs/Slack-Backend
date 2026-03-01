/**
 * Structured API error.
 * All intentional errors thrown in services/controllers should use this class.
 * The globalErrorHandler identifies it and serialises it consistently.
 */
class ApiError extends Error {
  public readonly statusCode: number;
  public readonly success: false = false;
  public readonly errors: unknown[];
  public readonly data: null = null;

  constructor(
    statusCode: number,
    message = 'Something went wrong',
    errors: unknown[] = [],
    stack = ''
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }

    // Restore prototype chain (required when extending built-in Error in TS)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export { ApiError };
