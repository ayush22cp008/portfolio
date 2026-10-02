/**
 * Rate limiting for Phase 3 retrieval.
 *
 * Uses the existing atomic PostgreSQL rate-limit mechanism:
 *   check_and_increment_rate_limit
 *
 * This wrapper provides:
 *   - HMAC-hashed client identifiers (never raw IPs)
 *   - Per-IP rate limiting
 *   - Global rate limiting
 *
 * SECURITY: The client never controls the rate-limit key.
 * The key is always HMAC-hashed server-side.
 */

import crypto from "crypto";
import { sql } from "./db";
import { RAG_CONFIG } from "./config";
import type { RateLimitResult } from "./types";

export interface RateLimitCheckResult {
  allowed: boolean;
  request_count: number;
  retry_after: number;
}

/**
 * Hash a client identifier with HMAC to create a rate-limit key.
 * Never stores raw IP addresses.
 */
function hashClientIdentifier(identifier: string): string {
  const secret = process.env.RATE_LIMIT_HMAC_SECRET;
  if (!secret) {
    throw new Error(
      "[rag/rate-limit] RATE_LIMIT_HMAC_SECRET environment variable is not set."
    );
  }
  return crypto.createHmac("sha256", secret).update(identifier).digest("hex");
}

/**
 * Check and increment the rate limit for a given key.
 * Uses the existing atomic PostgreSQL RPC.
 */
async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const result = await sql`
    SELECT * FROM check_and_increment_rate_limit(${key}, ${maxRequests}, ${windowSeconds});
  `;
  return result[0] as RateLimitResult;
}

/**
 * Check rate limits for a client.
 *
 * Checks both per-IP and global rate limits.
 * Returns the most restrictive result.
 *
 * @param clientIp - The client's IP address (will be HMAC-hashed)
 * @returns RateLimitCheckResult
 */
export async function checkRateLimits(
  clientIp: string
): Promise<RateLimitCheckResult> {
  // Allow tests to isolate rate-limit state via env override.
  // In production, this is undefined and the HMAC-hashed IP is used.
  const rateLimitKey = process.env.RATE_LIMIT_KEY || hashClientIdentifier(clientIp);

  // Check per-IP rate limit
  const ipResult = await checkRateLimit(
    rateLimitKey,
    RAG_CONFIG.rateLimit.perIpMax,
    RAG_CONFIG.rateLimit.perIpWindowSeconds
  );

  if (!ipResult.allowed) {
    return {
      allowed: false,
      request_count: ipResult.request_count,
      retry_after: ipResult.retry_after,
    };
  }

  // Check global rate limit
  // Read the key dynamically so tests can isolate rate-limit state
  const globalKey = process.env.RATE_LIMIT_GLOBAL_KEY || "__global__";
  const globalResult = await checkRateLimit(
    globalKey,
    RAG_CONFIG.rateLimit.globalMax,
    RAG_CONFIG.rateLimit.globalWindowSeconds
  );

  if (!globalResult.allowed) {
    return {
      allowed: false,
      request_count: globalResult.request_count,
      retry_after: globalResult.retry_after,
    };
  }

  return {
    allowed: true,
    request_count: ipResult.request_count,
    retry_after: 0,
  };
}
