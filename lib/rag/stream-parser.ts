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
  | { type: "error"; message: string };

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
