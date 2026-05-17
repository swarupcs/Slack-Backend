import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';

import { env } from '../config/env.config';
import type { JwtPayload } from '../types/jwt.types';

/**
 * Create a signed JWT token.
 */
export function createJWT(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRY as StringValue
  });
}

/**
 * Verify and decode a JWT token.
 * Throws on invalid/expired tokens.
 */
export function verifyJWT(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
