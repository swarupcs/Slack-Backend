import jwt from 'jsonwebtoken';

import { JWT_EXPIRY, JWT_SECRET } from '../../config/serverConfig';
import { JwtPayload } from '../../types/index';

/**
 * Creates a signed JWT token for the given payload.
 */
export const createJWT = (payload: JwtPayload): string =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

/**
 * Verifies and decodes a JWT token.
 * Throws if the token is invalid or expired.
 */
export const verifyJWT = (token: string): JwtPayload =>
  jwt.verify(token, JWT_SECRET) as JwtPayload;
