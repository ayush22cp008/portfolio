/**
 * Phase 4 — Streaming Ask Orchestrator
 *
 * Composes Phase 3 retrieval with Phase 4 LLM generation and produces
 * a NDJSON (newline-delimited JSON) byte stream suitable for streaming
 * to the browser via a Next.js App Router route.
 *
 * Wire format (each line is a JSON object followed by "\n"):
 *
 *   {"type":"start"}
 *   {"type":"token","content":"Hello"}
 *   {"type":"token","content":", "}
 *   {"type":"sources","sources":[{"chunk_index":0,"section":"intro","similarity":0.87}]}
 *   {"type":"done"}
 *
 * Error line (replaces remaining stream on failure):
 *   {"type":"error","message":"..."}
 *
 * SECURITY:
 *   - All orchestration is server-side.
 *   - Source metadata excludes raw content, database IDs, and embeddings.
 *   - The client receives only the streaming tokens and source metadata.
 *
 * Future observability:
 *   - `traceId` parameter is threaded through to `generateAnswer` for
 *     future Node 3 OpenTelemetry instrumentation without API changes.
 */

import { retrieve } from "./retrieval";
import { generateAnswer, buildSourceMeta } from "./llm";
// import { ScopeError } from "./types"; // removed unused import

/**
 * Sanitize an error for safe client transmission.
 * Returns a safe, user‑facing message based on known error patterns.
 *   • Validation failures → "Validation failed: <detail>"
 *   • Rate‑limit failures → "Rate limit exceeded. Retry after <seconds> seconds."
 *   • Anything else      → generic safe message.
 */
function sanitizeError(err: unknown): string {
  const generic = "An unexpected error occurred. Please try again later.";
  if (!(err instanceof Error)) return generic;
  const msg = err.message.trim();

  // Validation error: "[rag/retrieval] Validation failed: <detail>"
  const validationRe = /^\[rag\/retrieval\] Validation failed: (.+)$/i;
  const valMatch = validationRe.exec(msg);
  if (valMatch) {
    // Return a generic safe validation message preserving UI prefix.
    return `Validation failed: Please check your question and try again.`;
  }

  // Rate‑limit error: "[rag/retrieval] Rate limit exceeded. Retry after <seconds> seconds."
  const rateRe = /^\[rag\/retrieval\] Rate limit exceeded\. Retry after (\d+) seconds\.$/i;
  const rateMatch = rateRe.exec(msg);
  if (rateMatch) {
    const secs = Number(rateMatch[1]);
    // Validate numeric retry-after value (non‑negative, finite, reasonable size ≤ 86400 seconds)
    if (Number.isFinite(secs) && secs >= 0 && secs <= 86400) {
      return `Rate limit exceeded. Retry after ${secs} seconds.`;
    }
    // If malformed, fall back to generic message.
  }

  // Fallback to generic safe message.
  return generic;
}


// ---------------------------------------------------------------------------
// Wire protocol types
// ---------------------------------------------------------------------------

export type StreamFrame =
  | { type: "start" }
  | { type: "token"; content: string }
  | { type: "sources"; sources: ReturnType<typeof buildSourceMeta> }
  | { type: "done" }
  | { type: "error"; message: string }
  // Observability frames
  | { type: "activity"; stage: "retrieval" | "llm_generation"; status: "started" | "completed" | "failed"; timestamp: number; durationMs?: number; errorCode?: string }
  | { type: "tool"; name: string; status: "success" | "error"; durationMs: number; errorCode?: string }
  | { type: "trace"; traceId: string; overallDurationMs: number; stageDurations: { retrieval: number; llm_generation: number } };

// ---------------------------------------------------------------------------
// Encoder
// ---------------------------------------------------------------------------

const encoder = new TextEncoder();

function encodeFrame(frame: StreamFrame): Uint8Array {
  return encoder.encode(JSON.stringify(frame) + "\n");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Produce a ReadableStream of NDJSON frames for a given question.
 *
 * Calls Phase 3 `retrieve()` then streams the LLM answer token-by-token,
 * finally emitting a `sources` frame and a `done` frame.
 *
 * @param input     - Raw request body (will be validated inside `retrieve`)
 * @param clientIp  - Client IP for rate limiting
 * @param traceId   - Reserved for Node 3 tracing
 */
export function createAskStream(
  input: unknown,
  clientIp: string,
  traceId?: string,
  abortCtrl?: AbortController
): ReadableStream<Uint8Array> {
  // Local cancellation flag
  let isCancelled = false;
  let isClosed = false;
  // Error tracking
  let hasError = false;
  let errorMessage = "";
  // Token iterable for LLM generation
  let tokenIterable: AsyncIterable<string>;

  // Idempotent cancellation helper
  const cancelHelper = () => {
    if (!isCancelled) {
      isCancelled = true;
      abortCtrl?.abort();
    }
  };

    // No eventSink here; will be defined inside start where controller is available

  // Timing helpers
  const overallStart = Date.now();
  const stageStart: Record<string, number> = {};
  const stageDurations: Record<string, number> = {};

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      // Event sink for emitting frames safely
      const eventSink = (frame: StreamFrame) => {
        if (isCancelled || isClosed) return;
        try { controller.enqueue(encodeFrame(frame)); } catch {}
      };
      // Emit start frame
      eventSink({ type: "start" });

      // ---------- Retrieval stage ----------
      stageStart["retrieval"] = Date.now();
      eventSink({ type: "activity", stage: "retrieval", status: "started", timestamp: stageStart["retrieval"] });
      let retrievalResult;
      try {
        retrievalResult = await retrieve(input, clientIp);
        const dur = Date.now() - stageStart["retrieval"];
        stageDurations["retrieval"] = dur;
        eventSink({ type: "activity", stage: "retrieval", status: "completed", timestamp: Date.now(), durationMs: dur });
      } catch (err: unknown) {
        const dur = Date.now() - stageStart["retrieval"];
        stageDurations["retrieval"] = dur;
        const code = err instanceof Error ? "RETRIEVAL_ERROR" : "UNKNOWN_ERROR";
        eventSink({ type: "activity", stage: "retrieval", status: "failed", timestamp: Date.now(), durationMs: dur, errorCode: code });
        // Abort underlying operations but do not treat as consumer cancellation
        abortCtrl?.abort();
        hasError = true;
        errorMessage = sanitizeError(err);
        // Provide empty token iterable to skip token streaming
        tokenIterable = (async function*() {})();
      }

      // ---------- LLM generation stage ----------
      stageStart["llm_generation"] = Date.now();
      eventSink({ type: "activity", stage: "llm_generation", status: "started", timestamp: stageStart["llm_generation"] });

      if (!hasError && retrievalResult) {
        try {
          tokenIterable = await generateAnswer(
            retrievalResult.question,
            retrievalResult.chunks,
            traceId,
            abortCtrl?.signal,
            // Tool event callback
            (toolName: string, status: "success" | "error", durationMs: number, errorCode?: string) => {
              eventSink({ type: "tool", name: toolName, status, durationMs, errorCode });
            }
          );
        } catch (err: unknown) {
          const dur = Date.now() - stageStart["llm_generation"];
          stageDurations["llm_generation"] = dur;
          const code = err instanceof Error ? "LLM_ERROR" : "UNKNOWN_ERROR";
          eventSink({ type: "activity", stage: "llm_generation", status: "failed", timestamp: Date.now(), durationMs: dur, errorCode: code });
          abortCtrl?.abort();
          hasError = true;
          errorMessage = sanitizeError(err);
          tokenIterable = (async function*() {})();
        }
      } else {
        tokenIterable = (async function*() {})();
      }



      if (!hasError) {
        // Stream tokens
        for await (const token of tokenIterable) {
          eventSink({ type: "token", content: token });
        }
      }

      const llmDur = Date.now() - stageStart["llm_generation"];
      stageDurations["llm_generation"] = llmDur;
      eventSink({ type: "activity", stage: "llm_generation", status: "completed", timestamp: Date.now(), durationMs: llmDur });

      if (!hasError) {
        // Emit source metadata
        if (retrievalResult) {
          const sources = buildSourceMeta(retrievalResult.chunks);
          eventSink({ type: "sources", sources });
        }
      }

      // Emit trace summary if not cancelled
      if (!isCancelled) {
        const overallDur = Date.now() - overallStart;
        eventSink({
          type: "trace",
          traceId: traceId ?? "",
          overallDurationMs: overallDur,
          stageDurations: {
            retrieval: stageDurations["retrieval"] ?? 0,
            llm_generation: stageDurations["llm_generation"] ?? 0,
          },
        });
      }

      if (hasError) {
        eventSink({ type: "error", message: errorMessage });
      } else {
        eventSink({ type: "done" });
      }
      isClosed = true;
      controller.close();
    },
    cancel(reason) {
      // Consumer cancelled the stream
      cancelHelper();
    },
  });
}
