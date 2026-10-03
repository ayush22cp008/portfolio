/**
 * POST /api/ask  — Node 1, Phase 4
 *
 * Server-side streaming endpoint for the "Ask Ayush" RAG agent.
 *
 * Flow:
 *   POST /api/ask
 *     ↓ request parsing
 *     ↓ Phase 3 retrieval  (lib/rag/retrieval.ts)
 *     ↓ LLM generation     (lib/rag/llm.ts)
 *     ↓ NDJSON stream      (lib/rag/ask-stream.ts)
 *     ↓ source metadata
 *     ↓ done
 *
 * Wire format (NDJSON — one JSON object per line):
 *   {"type":"start"}
 *   {"type":"token","content":"..."}
 *   {"type":"sources","sources":[{"chunk_index":0,"section":"...","similarity":0.87}]}
 *   {"type":"done"}
 *
 * Error responses:
 *   - 400: Invalid JSON body or non-POST method (handled by Next.js routing)
 *   - 429: Rate limit exceeded  → {"type":"error","message":"..."}
 *   - 500: Internal server error → {"type":"error","message":"..."}
 *
 * The error is streamed as an NDJSON frame rather than an HTTP error status
 * because the client has already opened a streaming connection; a status
 * code change mid-stream is not possible.  If the error occurs *before*
 * any bytes are written the route returns a plain JSON error response.
 *
 * SECURITY:
 *   - All secrets are server-side (DATABASE_URL, GROQ_API_KEY, RATE_LIMIT_HMAC_SECRET).
 *   - No database credentials or LLM secrets are ever sent to the client.
 *   - No arbitrary SQL/RPC/table access is possible from the client.
 *   - Client IP is HMAC-hashed before use as a rate-limit key (in lib/rag/rate-limit.ts).
 *   - "server-only" import guard prevents accidental client-side import.
 *
 * Future observability (Node 3):
 *   - `traceId` from X-Trace-Id header is forwarded to the stream orchestrator.
 *     No-op until Node 3 instruments the call path.
 */

import "server-only";
import { type NextRequest, NextResponse } from "next/server";
import { createAskStream } from "@/lib/rag/ask-stream";

// ---------------------------------------------------------------------------
// Route duration configuration
// Streaming routes can take longer than the default 10 s limit.
// ---------------------------------------------------------------------------
export const maxDuration = 60; // seconds (Vercel Pro / hobby limits apply)
export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Client IP helper
// ---------------------------------------------------------------------------

/**
 * Extract the best available client IP from request headers.
 * Falls back to a stable placeholder when running locally without a proxy.
 */
function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1"
  );
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest): Promise<Response> {
  // --- Parse request body ------------------------------------------------
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  // --- Normalise body: accept { message } or { question } ----------------
  // The handoff uses the conceptual shape { "message": "..." }
  // Phase 3 retrieval.ts / validation.ts expect { "question": "..." }
  // We accept both and normalise here at the boundary.
  if (
    body !== null &&
    typeof body === "object" &&
    "message" in (body as object) &&
    !("question" in (body as object))
  ) {
    body = { question: (body as Record<string, unknown>).message };
  }

  // --- Extract tracing context (reserved for Node 3) ----------------------
  const traceId = req.headers.get("x-trace-id") ?? undefined;

  // --- Client IP for rate limiting ----------------------------------------
  const clientIp = getClientIp(req);

  // --- Create the NDJSON stream -------------------------------------------
  const stream = createAskStream(body, clientIp, traceId);

  // --- Return streaming response ------------------------------------------
  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
