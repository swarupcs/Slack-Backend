import type { Request } from 'express';

/**
 * Augmented Express Request with authenticated user info.
 */
export interface AuthenticatedRequest extends Request {
  user: string; // User ID from JWT
}

/**
 * Type guard to check if a request is authenticated.
 */
export function isAuthenticatedRequest(
  req: Request
): req is AuthenticatedRequest {
  return typeof (req as AuthenticatedRequest).user === 'string';
}
