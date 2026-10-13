"use client";

/**
 * Node 1 — Phase 5: "Ask Ayush" Chat Section
 *
 * An isolated, self-contained "use client" component that renders a
 * full chat experience powered by the Phase 4 /api/ask streaming endpoint.
 *
 * States handled:
 *   idle        — input enabled, example prompts visible
 *   submitting  — spinner, "Thinking…" button text
 *   streaming   — live token append with blinking cursor
 *   done        — answer complete, sources disclosure, input re-enabled
 *   error       — generic / rate-limited / validation variants
 *
 * Architecture rules enforced:
 *   - Imports ONLY from lib/rag/stream-parser (client-safe) and lucide-react.
 *   - Does NOT import from lib/rag/db, lib/rag/llm, lib/rag/retrieval,
 *     lib/rag/rate-limit, or app/api/ask/route.ts.
 *   - All secrets remain server-side; this component sends a plain fetch.
 *
 * Design:
 *   - Matches the existing portfolio section convention:
 *       mx-auto max-w-5xl px-6 py-20
 *   - Uses only the existing design tokens from globals.css.
 *   - No new global CSS classes; no new npm dependencies.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";
import {
  parseNDJSONStream,
  type ClientSourceMeta,
} from "@/lib/rag/stream-parser";

// Markdown rendering
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_LENGTH = 1000;
const CHAR_WARN = 800;
const CHAR_DANGER = 900;

const EXAMPLE_PROMPTS = [
  "What stack did Ayush use in TableFlow?",
  "How does DeliveryProof handle evidence collection?",
  "What AI/ML projects has Ayush built?",
  "How does Ayush approach building with AI agents?",
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The current lifecycle stage of the chat request. */
type Status = "idle" | "submitting" | "streaming" | "done";

/** Distinguishes between different error categories for targeted messaging. */
type ErrorKind = "rate-limited" | "validation" | "generic" | null;

// ---------------------------------------------------------------------------
// Pure helpers (no React, easily testable)
// ---------------------------------------------------------------------------

function classifyError(message: string): ErrorKind {
  if (message.includes("Rate limit exceeded")) return "rate-limited";
  if (message.includes("Validation failed")) return "validation";
  return "generic";
}

/** Extract retry duration from the rate-limit error message, in minutes. */
function extractRetryMinutes(message: string): number | null {
  const match = /Retry after (\d+) seconds/.exec(message);
  if (!match) return null;
  return Math.ceil(parseInt(match[1], 10) / 60);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Accessible visually-hidden label helper */
function SrOnly({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]">
      {children}
    </span>
  );
}

/** A single retrieved source pill shown in the sources disclosure. */
function SourcePill({ source, index }: { source: ClientSourceMeta; index: number }) {
  const label = source.section ?? `chunk ${source.chunk_index}`;
  const pct = Math.round(source.similarity * 100);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#232B36] px-3 py-1 text-xs">
      <span className="font-medium text-[#5EEAD4]">#{index + 1}</span>
      <span className="text-[#8B93A1]">·</span>
      <span className="text-[#8B93A1]">{label}</span>
      <span className="text-[#232B36]">·</span>
      <span className="text-[#8B93A1]">{pct}%</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AskAyush() {
  // ── State ────────────────────────────────────────────────────────────────

  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<ClientSourceMeta[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorKind, setErrorKind] = useState<ErrorKind>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [inputError, setInputError] = useState("");
  const [showSources, setShowSources] = useState(false);
  // New trace viewer state
  const [activityEvents, setActivityEvents] = useState<Array<{stage: "retrieval" | "llm_generation"; status: "started" | "completed" | "failed"; timestamp: number; durationMs?: number; errorCode?: string}>>([]);
  const [toolEvents, setToolEvents] = useState<Array<{name: string; status: "success" | "error"; durationMs: number; errorCode?: string}>>([]);
  const [traceInfo, setTraceInfo] = useState<null | {traceId: string; overallDurationMs: number; stageDurations: {retrieval?: number; llm_generation?: number}}>(null);
  const [showTrace, setShowTrace] = useState(false);
  // ── Refs ─────────────────────────────────────────────────────────────────

  const abortRef = useRef<AbortController | null>(null);
  const answerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // ── Derived state ────────────────────────────────────────────────────────

  const isBusy = status === "submitting" || status === "streaming";
  const hasResult = status === "submitting" || status === "streaming" || status === "done";
  const charCount = message.length;

  // ── Character counter colour ─────────────────────────────────────────────

  const charCountClass =
    charCount >= MAX_LENGTH
      ? "text-red-400"
      : charCount >= CHAR_DANGER
      ? "text-[#F0B429]"
      : "text-[#8B93A1]";

  // ── Effects ──────────────────────────────────────────────────────────────

  /** Smooth-scroll the answer into view while tokens are arriving. */
  useEffect(() => {
    if (status !== "streaming" || !answerRef.current) return;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      answerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }, [answer, status]);

  /** Abort any in-flight request when the component unmounts. */
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── Textarea auto-resize ─────────────────────────────────────────────────

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, []);

  // ── Event handlers ───────────────────────────────────────────────────────

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (inputError) setInputError("");
    resizeTextarea();
  };

  /** Enter submits; Shift+Enter inserts a newline. */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  /** Fill the textarea with an example prompt. */
  const handleExampleClick = (prompt: string) => {
    setMessage(prompt);
    setInputError("");
    // Resize after React has flushed the value change
    setTimeout(resizeTextarea, 0);
    textareaRef.current?.focus();
  };

  // ── Submit handler ───────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    // Guard: no duplicate submissions
    if (isBusy) return;

    const trimmed = message.trim();
    if (!trimmed) {
      setInputError("Please type a question.");
      return;
    }

    // Cancel any previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Reset result state, keep the message until done
    setStatus("submitting");
    setAnswer("");
    setSources([]);
    setShowSources(false);
    setErrorKind(null);
    setErrorMessage("");
    setInputError("");
    // Reset trace viewer state
    setActivityEvents([]);
    setToolEvents([]);
    setTraceInfo(null);
    setShowTrace(false);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
        signal: controller.signal,
      });

      // Pre-stream HTTP error (e.g., 400 bad JSON)
      if (!res.ok) {
        let msg = `Server error (${res.status}).`;
        try {
          const json = (await res.json()) as { error?: string };
          if (json.error) msg = json.error;
        } catch {
          /* ignore parse error */
        }
        setErrorKind("generic");
        setErrorMessage(msg);
        setStatus("done");
        return;
      }

      if (!res.body) {
        setErrorKind("generic");
        setErrorMessage("No response body received.");
        setStatus("done");
        return;
      }

      // ── Consume the NDJSON stream ────────────────────────────────────────

      for await (const frame of parseNDJSONStream(res.body)) {
        // Stop processing if the request was aborted (component unmounted
        // or user navigated away)
        if (controller.signal.aborted) break;

        switch (frame.type) {
          case "start":
            setStatus("streaming");
            break;

          case "token":
            setAnswer((prev) => prev + frame.content);
            break;

          case "sources":
            setSources(frame.sources);
            break;

          case "done":
            setStatus("done");
            // Clear the input so the user can ask a follow-up
            setMessage("");
            if (textareaRef.current) {
              textareaRef.current.style.height = "auto";
            }
            break;

          case "error": {
            const kind = classifyError(frame.message);
            setErrorKind(kind);
            setErrorMessage(frame.message);
            // Keep whatever partial answer streamed before the error
            setStatus("done");
            break;
          }

          case "activity": {
            setActivityEvents((prev) => [
              ...prev,
              {
                stage: frame.stage,
                status: frame.status,
                timestamp: frame.timestamp,
                durationMs: frame.durationMs,
                errorCode: frame.errorCode,
              },
            ]);
            break;
          }

          case "tool": {
            setToolEvents((prev) => [
              ...prev,
              {
                name: frame.name,
                status: frame.status,
                durationMs: frame.durationMs,
                errorCode: frame.errorCode,
              },
            ]);
            break;
          }

          case "trace": {
            setTraceInfo({
              traceId: frame.traceId,
              overallDurationMs: frame.overallDurationMs,
              stageDurations: frame.stageDurations,
            });
            break;
          }
        }
      }
    } catch (err: unknown) {
      // AbortError is expected when the user navigates away — not an error
      if (err instanceof Error && err.name === "AbortError") return;
      setErrorKind("generic");
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("done");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, isBusy, resizeTextarea]);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <section id="ask" className="mx-auto max-w-5xl px-6 py-20">

      {/* ── Section heading ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Sparkles size={14} className="text-[#5EEAD4]" />
        <p className="font-display text-xs font-medium uppercase tracking-wide text-[#5EEAD4]">
          Ask Ayush
        </p>
      </div>
      <h2 className="mt-3 font-display text-2xl font-semibold text-[#E6E8EB]">
        Have a question about my work?
      </h2>
      <div className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#8B93A1]">
        <p>
          Ask Ayush is a grounded AI assistant built to answer questions about Ayush&apos;s selected portfolio projects and engineering methodology. Rather than exposing every repository, Ask Ayush focuses on five selected projects that represent key areas of Ayush&apos;s work, along with his documented engineering and AI-agent methodology.
        </p>

        <div className="mt-5 rounded-lg border border-[#232B36] bg-[#121821]/50 p-4">
          <p className="text-sm leading-relaxed">
            <strong className="font-medium text-[#E6E8EB]">Covers:</strong> ZENI &middot; TableFlow &middot; DeliveryProof &middot; NCERT AI Tutor &middot; Mechanical Part Detection
          </p>
          <p className="mt-3 text-sm leading-relaxed">
            <strong className="font-medium text-[#E6E8EB]">You can ask about:</strong> project architecture, technologies used, engineering decisions, challenges and how they were addressed, comparisons between the selected projects, how Ayush plans and builds projects, how he works with AI coding agents, and how he investigates and verifies engineering work.
          </p>
          <p className="mt-3 text-sm italic text-[#8B93A1]/90 leading-relaxed">
            Current scope: these five selected projects and Ayush&apos;s documented engineering / AI-agent methodology. Other repositories, unrelated general questions, and information outside the portfolio knowledge base are not currently covered.
          </p>
        </div>
      </div>

      {/* ── Example prompts ─────────────────────────────────────────────── */}
      <div className="mt-6 flex flex-wrap gap-2" aria-label="Example questions">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => handleExampleClick(prompt)}
            disabled={isBusy}
            className="rounded-full border border-[#232B36] px-3.5 py-1.5 text-sm text-[#8B93A1] transition-colors hover:border-[#5EEAD4]/50 hover:text-[#5EEAD4] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* ── Input form ──────────────────────────────────────────────────── */}
      <form
        aria-label="Ask Ayush a question"
        className="mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
      >
        <div
          className={`rounded-xl border bg-[#121821] transition-colors ${
            inputError
              ? "border-red-500/60"
              : "border-[#232B36] focus-within:border-[#5EEAD4]/50"
          }`}
        >
          {/* Visually-hidden label for accessibility */}
          <label htmlFor="ask-input">
            <SrOnly>Your question for Ayush</SrOnly>
          </label>

          <textarea
            id="ask-input"
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            disabled={isBusy}
            maxLength={MAX_LENGTH}
            rows={3}
            placeholder="What would you like to know about my work?"
            aria-describedby={inputError ? "ask-input-error" : undefined}
            className="block w-full resize-none rounded-t-xl bg-transparent px-4 pb-2 pt-4 text-[15px] text-[#E6E8EB] placeholder-[#8B93A1]/60 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            style={{ minHeight: "80px", maxHeight: "200px" }}
          />

          {/* Footer row: char counter + submit */}
          <div className="flex items-center justify-between px-4 pb-3 pt-1">
            {/* Character counter — visible only when nearing limit */}
            <span
              aria-live="polite"
              className={`text-xs tabular-nums transition-colors ${
                charCount >= CHAR_WARN ? charCountClass : "invisible select-none"
              }`}
            >
              {charCount}/{MAX_LENGTH}
            </span>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isBusy || charCount === 0}
              aria-label={isBusy ? "Generating answer…" : "Send question"}
              className="inline-flex items-center gap-2 rounded-md bg-[#5EEAD4] px-4 py-2 text-sm font-medium text-[#0B0F14] transition-colors hover:bg-[#2DD4BF] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isBusy ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Thinking…
                </>
              ) : (
                <>
                  <Send size={14} />
                  Ask
                </>
              )}
            </button>
          </div>
        </div>

        {/* Inline input error */}
        {inputError && (
          <p
            id="ask-input-error"
            role="alert"
            className="mt-2 flex items-center gap-1.5 text-sm text-red-400"
          >
            <AlertCircle size={13} className="shrink-0" />
            {inputError}
          </p>
        )}

        <p className="mt-2 text-xs text-[#8B93A1]">
          <kbd className="rounded border border-[#232B36] px-1 py-0.5 font-mono text-[10px]">
            Enter
          </kbd>{" "}
          to send ·{" "}
          <kbd className="rounded border border-[#232B36] px-1 py-0.5 font-mono text-[10px]">
            Shift
          </kbd>
          {"+"}
          <kbd className="rounded border border-[#232B36] px-1 py-0.5 font-mono text-[10px]">
            Enter
          </kbd>{" "}
          for new line
        </p>
      </form>

      {/* ── Answer area (visible once a request has been made) ──────────── */}
      {hasResult && (
        <div
          ref={answerRef}
          className="mt-8 rounded-xl border border-[#232B36] bg-[#121821] p-6"
        >
          {/* Loading state */}
          {status === "submitting" && (
            <div role="status" className="flex items-center gap-2 text-[#8B93A1]">
              <Loader2 size={15} className="animate-spin text-[#5EEAD4]" />
              <span className="text-sm">
                Retrieving context and generating answer…
              </span>
            </div>
          )}

          {/* Streaming / done answer text */}
          {(status === "streaming" || status === "done") && answer && (
            <div
              role="region"
              aria-label="Answer"
              aria-live="polite"
              aria-atomic="false"
              aria-busy={status === "streaming"}
              className="whitespace-pre-wrap text-[15px] leading-relaxed text-[#E6E8EB]"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
              {/* Blinking cursor during streaming */}
              {status === "streaming" && (
                <span
                  aria-hidden="true"
                  className="ml-0.5 inline-block h-[1em] w-0.5 translate-y-[1px] bg-[#5EEAD4] align-middle animate-pulse"
                />
              )}
            </div>
          )}

          {/* Error banner — rendered inside the answer card */}
          {status === "done" && errorKind !== null && (
            <div
              role="alert"
              className={`flex items-start gap-2 ${answer ? "mt-5 border-t border-[#232B36] pt-5" : ""}`}
            >
              <AlertCircle
                size={15}
                className={`mt-0.5 shrink-0 ${
                  errorKind === "rate-limited"
                    ? "text-[#F0B429]"
                    : "text-red-400"
                }`}
              />
              <div>
                {errorKind === "rate-limited" && (
                  <p className="text-sm text-[#F0B429]">
                    Request limit reached.{" "}
                    {(() => {
                      const mins = extractRetryMinutes(errorMessage);
                      return mins !== null
                        ? `Try again in ~${mins} minute${mins === 1 ? "" : "s"}.`
                        : "Please try again later.";
                    })()}
                  </p>
                )}
                {errorKind === "validation" && (
                  <p className="text-sm text-red-400">
                    {errorMessage
                      .replace(/^\[rag\/retrieval\]\s*Validation failed:\s*/i, "")
                      .replace(/^\[rag\/.*?\]\s*/i, "")}
                  </p>
                )}
                {errorKind === "generic" && (
                  <p className="text-sm text-red-400">
                    Something went wrong. Please try again.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Trace viewer — toggle and details */}
          {status === "done" && (activityEvents.length > 0 || toolEvents.length > 0 || traceInfo) && (
            <div className="mt-5 border-t border-[#232B36] pt-4">
              <button
                type="button"
                onClick={() => setShowTrace((s) => !s)}
                className="flex items-center gap-1.5 text-xs text-[#8B93A1] transition-colors hover:text-[#5EEAD4]"
                aria-expanded={showTrace}
                aria-controls="trace-viewer"
                aria-label="Toggle trace viewer"
              >
                {showTrace ? "Hide trace" : "Show trace"}
              </button>
              {showTrace && (
                <div id="trace-viewer" className="mt-3 space-y-4 text-xs text-[#8B93A1]">
                  {/* Trace Summary */}
                  {traceInfo && (
                    <div className="border-b border-[#232B36] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Trace ID:</span>
                        <code className="bg-[#232B36] rounded px-1 py-0.5">{traceInfo.traceId.slice(0, 8)}…</code>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(traceInfo.traceId)}
                          className="text-[#5EEAD4] hover:underline"
                          aria-label="Copy trace ID"
                        >
                          Copy
                        </button>
                      </div>
                      <div>Total duration: {traceInfo.overallDurationMs} ms</div>
                      {traceInfo.stageDurations && (
                        <div className="mt-1">
                          {Object.entries(traceInfo.stageDurations).map(([stage, ms]) => (
                            <div key={stage}>{stage}: {ms} ms</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Activity Timeline */}
                  {activityEvents.length > 0 && (
                    <div className="border-b border-[#232B36] pb-2">
                      <div className="font-medium mb-1">Activity</div>
                      <ul className="list-disc list-inside space-y-1">
                        {Object.values(
                          activityEvents.reduce((acc, ev) => {
                            const key = ev.stage;
                            const existing = acc[key] || {};
                            const status = ev.status === "completed" ? "completed" : existing.status || ev.status;
                            const duration = ev.durationMs ?? existing.duration;
                            const error = ev.errorCode ?? existing.error;
                            acc[key] = { stage: ev.stage, status, duration, error };
                            return acc;
                          }, {} as Record<string, { stage: string; status: string; duration?: number; error?: string }>)
                        ).map((item) => (
                          <li key={item.stage}>
                            <span className="capitalize">{item.stage.replace("_", " ")}</span>: {item.status}
                            {item.duration !== undefined && <span> ({item.duration} ms)</span>}
                            {item.error && <span className="text-red-400"> – error: {item.error}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tool Activity */}
                  {toolEvents.length > 0 && (
                    <div>
                      <div className="font-medium mb-1">Tools</div>
                      <ul className="list-disc list-inside space-y-1">
                        {toolEvents.map((t, i) => (
                          <li key={i}>
                            <span className="font-medium">{t.name}</span>: {t.status} {t.durationMs} ms
                            {t.errorCode && <span className="text-red-400"> – error: {t.errorCode}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Sources disclosure — shown after a successful completion */}
          {status === "done" && sources.length > 0 && errorKind === null && (
            <div className="mt-5 border-t border-[#232B36] pt-4">
              <button
                type="button"
                onClick={() => setShowSources((s) => !s)}
                className="flex items-center gap-1.5 text-xs text-[#8B93A1] transition-colors hover:text-[#5EEAD4]"
                aria-expanded={showSources}
                aria-controls="ask-sources-list"
              >
                {showSources ? (
                  <ChevronUp size={13} />
                ) : (
                  <ChevronDown size={13} />
                )}
                {showSources ? "Hide" : "Show"} retrieved sources (
                {sources.length})
              </button>

              {showSources && (
                <div
                  id="ask-sources-list"
                  className="mt-3 flex flex-wrap gap-2"
                  role="list"
                  aria-label="Retrieved sources"
                >
                  {sources.map((src, i) => (
                    <span key={`${src.chunk_index}-${i}`} role="listitem">
                      <SourcePill source={src} index={i} />
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
