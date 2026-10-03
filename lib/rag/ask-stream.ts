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

// ---------------------------------------------------------------------------
// Wire protocol types
// ---------------------------------------------------------------------------

export type StreamFrame =
  | { type: "start" }
  | { type: "token"; content: string }
  | { type: "sources"; sources: ReturnType<typeof buildSourceMeta> }
  | { type: "done" }
  | { type: "error"; message: string };

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
  traceId?: string
): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        // Signal stream start
        controller.enqueue(encodeFrame({ type: "start" }));

        // Phase 3: retrieve relevant chunks
        const retrieval = await retrieve(input, clientIp);

        // Phase 4: generate answer
        const tokenIterable = await generateAnswer(
          retrieval.question,
          retrieval.chunks,
          traceId
        );

        // Stream tokens
        for await (const token of tokenIterable) {
          controller.enqueue(encodeFrame({ type: "token", content: token }));
        }

        // Emit source metadata (safe, non-sensitive fields only)
        const sources = buildSourceMeta(retrieval.chunks);
        controller.enqueue(encodeFrame({ type: "sources", sources }));

        // Signal completion
        controller.enqueue(encodeFrame({ type: "done" }));
        controller.close();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Unknown error occurred.";
        try {
          controller.enqueue(encodeFrame({ type: "error", message }));
          controller.close();
        } catch {
          // Controller may already be closed; silently ignore.
          controller.error(err);
        }
      }
    },
  });
}
