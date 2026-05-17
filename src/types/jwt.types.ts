/**
 * JWT payload for user authentication tokens.
 */
export interface JwtPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}
