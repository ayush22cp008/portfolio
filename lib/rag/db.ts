/**
 * Server-side Neon PostgreSQL client.
 *
 * This module exports a configured Neon SQL client for interacting
 * with the PostgreSQL database.
 *
 * SECURITY RULES (enforced here):
 *   - Uses DATABASE_URL — never NEXT_PUBLIC_*.
 *   - This file must NEVER be imported by client components.
 *   - All RAG queries execute on the server.
 *   - Environment variables are validated at import time so a
 *     misconfigured deployment fails loudly at startup.
 */

import { neon } from "@neondatabase/serverless";

// ---------------------------------------------------------------------------
// Environment variable validation
// ---------------------------------------------------------------------------
// Validate at module load time. If these are missing the server will fail
// on the first import rather than on a live request.

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "[rag/db] DATABASE_URL environment variable is not set. " +
      "Add it to .env.local (server-side only, no NEXT_PUBLIC_ prefix)."
  );
}

// ---------------------------------------------------------------------------
// Client creation
// ---------------------------------------------------------------------------

/**
 * The tagged template literal SQL function provided by @neondatabase/serverless.
 * Example usage:
 *   await sql`SELECT * FROM users WHERE id = ${userId}`;
 * 
 * For dynamically constructed queries:
 *   await sql.query(queryString, valuesArray);
 */
export const sql = neon(databaseUrl);
