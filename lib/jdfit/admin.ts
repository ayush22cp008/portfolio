// lib/jdfit/admin.ts
// Trigger reload for env vars

/**
 * Simple admin authentication utilities for JD‑Fit dashboard.
 * Uses environment variables:
 *   JDFIT_ADMIN_USERNAME
 *   JDFIT_ADMIN_PASSWORD
 *   JDFIT_SESSION_SECRET
 *
 * Provides:
 *   - verifyCredentials(username, password): boolean
 *   - createSessionToken(): string (signed JWT-like token)
 *   - verifySessionToken(token): boolean
 */

import * as jwt from 'jsonwebtoken';

const ADMIN_USERNAME = process.env.JDFIT_ADMIN_USERNAME || '';
const ADMIN_PASSWORD = process.env.JDFIT_ADMIN_PASSWORD || '';
const SESSION_SECRET = process.env.JDFIT_SESSION_SECRET || '';

/** Verify plain credentials against env values */
export function verifyCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD && !!ADMIN_USERNAME;
}

/** Create a signed session token (valid for 8h) */
export function createSessionToken(): string {
  const payload = { admin: true };
  // token expires in 8 hours
  return jwt.sign(payload, SESSION_SECRET, { expiresIn: '8h' });
}

/** Verify token, returns true if valid admin token */
export function verifySessionToken(token: string): boolean {
  try {
    const decoded = jwt.verify(token, SESSION_SECRET) as any;
    return typeof decoded === 'object' && decoded !== null && (decoded as any).admin === true;
  } catch {
    return false;
  }
}
