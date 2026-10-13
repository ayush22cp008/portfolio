/**
 * Phase 5 — Client-side NDJSON stream parser
 *
 * Parses the NDJSON byte stream produced by POST /api/ask.
 *
 * Wire format (one JSON object per line, terminated by "\n"):
 *   {"type":"start"}
 *   {"type":"token","content":"Hello"}
 *   {"type":"sources","sources":[{"chunk_index":0,"section":"Intro","similarity":0.91}]}
 *   {"type":"done"}
 *   {"type":"error","message":"..."}
 *
 * IMPORTANT — CLIENT-SAFE:
 *   - No "server-only" import.
 *   - No imports from Phase 3 or Phase 4 server modules.
 *   - Uses only browser globals (ReadableStream, TextDecoder).
 *   - Safe to use from "use client" components.
 *
 * Design:
 *   - Maintains a string line-buffer so chunks that split across JSON
 *     line boundaries are handled correctly.
 *   - Unknown frame types are silently dropped (forward-compatible).
 *   - Malformed JSON lines are silently dropped.
 *   - Exposed as an async generator for clean consumption in a for-await loop.
 */

// ---------------------------------------------------------------------------
// Client-safe type definitions
// These mirror the server-side StreamFrame / SourceMeta types without
// importing from any server module.
// ---------------------------------------------------------------------------

export interface ClientSourceMeta {
  chunk_index: number;
  section: string | null;
  similarity: number;
}

export type ClientStreamFrame =
  | { type: "start" }
  | { type: "token"; content: string }
  | { type: "sources"; sources: ClientSourceMeta[] }
  | { type: "done" }
  | { type: "error"; message: string }
  // New observability frames
  | { type: "activity"; stage: "retrieval" | "llm_generation"; status: "started" | "completed" | "failed"; timestamp: number; durationMs?: number; errorCode?: string }
  | { type: "tool"; name: string; status: "success" | "error"; durationMs: number; errorCode?: string }
  | { type: "trace"; traceId: string; overallDurationMs: number; stageDurations: { retrieval: number; llm_generation: number } };

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

/**
 * Parse a ReadableStream<Uint8Array> of NDJSON into typed ClientStreamFrame
 * objects, yielded as they arrive.
 *
 * Uses a line buffer to correctly handle fetch chunks that split mid-JSON-line.
 * TextDecoder is constructed inside the function body to avoid SSR issues.
 *
 * @param stream  The raw ReadableStream from `response.body`
 * @yields        ClientStreamFrame objects in arrival order
 */
export async function* parseNDJSONStream(
  stream: ReadableStream<Uint8Array>
): AsyncGenerator<ClientStreamFrame> {
  const reader = stream.getReader();
  // {stream:true} handles multi-byte UTF-8 sequences split across chunks
  const decoder = new TextDecoder("utf-8", { fatal: false });
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // Flush any remaining content in the buffer
        const remaining = buffer.trim();
        if (remaining) {
          const frame = tryParseFrame(remaining);
          if (frame !== null) yield frame;
        }
        break;
      }

      // Append the decoded chunk to the buffer
      buffer += decoder.decode(value, { stream: true });

      // Split on newlines.  The last element is either empty (complete line)
      // or an incomplete line — keep it in the buffer for the next chunk.
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const frame = tryParseFrame(trimmed);
        if (frame !== null) yield frame;
      }
    }
  } finally {
    // Always release the reader lock, even if an error occurs upstream
    try {
      reader.releaseLock();
    } catch {
      // Ignore — lock may already be released
    }
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Attempt to parse a single NDJSON line into a ClientStreamFrame.
 * Returns null if the line is not valid JSON or not a recognised frame type.
 */
function tryParseFrame(line: string): ClientStreamFrame | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(line);
  } catch {
    // Malformed JSON — silently drop
    return null;
  }
  return isClientStreamFrame(parsed) ? parsed : null;
}

/**
 * Type guard that validates the parsed object is a ClientStreamFrame.
 * Unknown types are treated as null (forward-compatible with future frame types).
 */
function isClientStreamFrame(value: unknown): value is ClientStreamFrame {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  const sd = obj.stageDurations as Record<string, unknown>;
  if (typeof obj.type !== "string") return false;

  switch (obj.type) {
    case "start":
    case "done":
      return true;

    case "token":
      return typeof obj.content === "string";

    case "sources":
      return Array.isArray(obj.sources) && obj.sources.every(isClientSourceMeta);

    case "error":
      return typeof obj.message === "string";

    case "activity":
      return (
        typeof obj.stage === "string" &&
        (obj.stage === "retrieval" || obj.stage === "llm_generation") &&
        typeof obj.status === "string" &&
        (obj.status === "started" || obj.status === "completed" || obj.status === "failed") &&
        typeof obj.timestamp === "number" && Number.isFinite(obj.timestamp) && obj.timestamp >= 0 &&
        (obj.durationMs === undefined || (typeof obj.durationMs === "number" && Number.isFinite(obj.durationMs) && obj.durationMs >= 0)) &&
        (obj.errorCode === undefined || (typeof obj.errorCode === "string" && obj.errorCode.length <= 100))
      );

    case "tool":
      return (
        typeof obj.name === "string" &&
        (obj.name === "get_project_details" || obj.name === "fetch_github_stats") &&
        typeof obj.status === "string" && (obj.status === "success" || obj.status === "error") &&
        typeof obj.durationMs === "number" && Number.isFinite(obj.durationMs) && obj.durationMs >= 0 &&
        (obj.errorCode === undefined || (typeof obj.errorCode === "string" && obj.errorCode.length <= 100))
      );

    case "trace":
      return (
        typeof obj.traceId === "string" && obj.traceId.length > 0 && obj.traceId.length <= 64 && ( /^[a-f0-9]{8,32}$/i.test(obj.traceId) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(obj.traceId) ) &&
        typeof obj.overallDurationMs === "number" && Number.isFinite(obj.overallDurationMs) && obj.overallDurationMs >= 0 &&
        typeof obj.stageDurations === "object" && obj.stageDurations !== null &&
        // each key must be a known stage and value a non‑negative finite number (or undefined)
        (Object.keys(sd).every(k => k === "retrieval" || k === "llm_generation")) &&
        (sd.retrieval === undefined || (typeof sd.retrieval === "number" && Number.isFinite(sd.retrieval) && sd.retrieval >= 0)) &&
        (sd.llm_generation === undefined || (typeof sd.llm_generation === "number" && Number.isFinite(sd.llm_generation) && sd.llm_generation >= 0))
      );

    default:
      // Unknown frame type — silently drop
      return false;
  }
}

/**
 * Type guard for ClientSourceMeta array elements.
 */
function isClientSourceMeta(value: unknown): value is ClientSourceMeta {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.chunk_index === "number" &&
    (obj.section === null || typeof obj.section === "string") &&
    typeof obj.similarity === "number"
  );
}
