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
    <span className="inline-flex items-center gap-1.5 border border-[#111111]/20 bg-white px-3 py-1 text-xs">
      <span className="font-bold text-[#0047FF]">#{index + 1}</span>
      <span className="text-[#999999]">·</span>
      <span className="font-medium text-[#333333]">{label}</span>
      <span className="text-[#999999]">·</span>
      <span className="text-[#666666]">{pct}% match</span>
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
    charCount >= CHAR_DANGER
      ? "text-red-600 font-bold"
      : charCount >= CHAR_WARN
      ? "text-[#F0B429] font-medium"
      : "text-[#777777]";

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
    <section id="ask" className="border-b border-[#111111]/15 bg-[#F9F8F6]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        {/* ── Section heading ─────────────────────────────────────────────── */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#111111]/15 pb-6 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#0047FF]">
              SECTION // 04 — INTERACTIVE RAG
            </span>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight text-[#111111] sm:text-5xl">
              ASK AYUSH
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0047FF]">
            <Sparkles size={14} />
            <span>GROUNDED ARCHIVAL ASSISTANT</span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          {/* Left Column: Scope & Guidelines */}
          <div>
            <div className="border border-[#111111] bg-white p-6 shadow-[6px_6px_0px_0px_#111111]">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#777777]">
                RETRIEVAL BOUNDARIES
              </span>
              <p className="mt-3 text-sm leading-relaxed text-[#444444]">
                Ask Ayush is a grounded retrieval-augmented AI assistant designed to
                answer questions strictly about Ayush&apos;s verified projects,
                architecture decisions, and agentic workflows.
              </p>

              <div className="mt-5 border-t border-[#111111]/15 pt-4">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#111111]">
                  COVERED PROJECTS:
                </span>
                <p className="mt-2 text-xs font-medium text-[#555555]">
                  TableFlow · DeliveryProof · ZENI · NCERT AI Tutor · Mechanical Part Detection
                </p>
              </div>

              <div className="mt-5 border-t border-[#111111]/15 pt-4">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#111111]">
                  APPROVED TOPICS:
                </span>
                <p className="mt-2 text-xs leading-relaxed text-[#555555]">
                  Database schema design, atomic RPC patterns, RLS policies,
                  production bug investigations, and AI-agent pair-programming methodology.
                </p>
              </div>
            </div>

            {/* Example prompts */}
            <div className="mt-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                SUGGESTED INQUIRIES:
              </span>
              <div className="mt-3 flex flex-col gap-2" aria-label="Example questions">
                {EXAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleExampleClick(prompt)}
                    disabled={isBusy}
                    className="border border-[#111111]/20 bg-white p-3 text-left text-xs font-medium text-[#333333] transition-all hover:border-[#0047FF] hover:text-[#0047FF] hover:shadow-[3px_3px_0px_0px_#0047FF] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    &ldquo;{prompt}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Chat Box */}
          <div>
            <form
              aria-label="Ask Ayush a question"
              onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit();
              }}
            >
              <div
                className={`border bg-white transition-colors ${
                  inputError
                    ? "border-red-600"
                    : "border-[#111111] focus-within:border-[#0047FF] focus-within:shadow-[6px_6px_0px_0px_#0047FF]"
                }`}
              >
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
                  placeholder="Ask a technical or architectural question about Ayush's projects..."
                  aria-describedby={inputError ? "ask-input-error" : undefined}
                  className="block w-full resize-none bg-transparent p-4 text-sm font-normal text-[#111111] placeholder-[#777777] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ minHeight: "100px", maxHeight: "200px" }}
                />

                {/* Footer row: char counter + submit */}
                <div className="flex items-center justify-between border-t border-[#111111]/15 bg-[#F9F8F6] px-4 py-2.5">
                  <span
                    aria-live="polite"
                    className={`text-xs tabular-nums transition-colors ${
                      charCount >= CHAR_WARN ? charCountClass : "invisible select-none"
                    }`}
                  >
                    {charCount}/{MAX_LENGTH}
                  </span>

                  <button
                    type="submit"
                    disabled={isBusy || charCount === 0}
                    aria-label={isBusy ? "Generating answer…" : "Send question"}
                    className="inline-flex items-center gap-2 border border-[#111111] bg-[#111111] px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all hover:border-[#0047FF] hover:bg-[#0047FF] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isBusy ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Generating…
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        Query Agent
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
                  className="mt-2 flex items-center gap-1.5 text-xs font-bold text-red-600"
                >
                  <AlertCircle size={13} className="shrink-0" />
                  {inputError}
                </p>
              )}

              <p className="mt-2 text-[11px] font-medium text-[#777777]">
                <kbd className="border border-[#111111]/30 bg-white px-1 py-0.5 font-mono text-[10px] text-[#111111]">
                  Enter
                </kbd>{" "}
                to send ·{" "}
                <kbd className="border border-[#111111]/30 bg-white px-1 py-0.5 font-mono text-[10px] text-[#111111]">
                  Shift
                </kbd>
                {"+"}
                <kbd className="border border-[#111111]/30 bg-white px-1 py-0.5 font-mono text-[10px] text-[#111111]">
                  Enter
                </kbd>{" "}
                for new line
              </p>
            </form>

            {/* ── Answer area (visible once a request has been made) ──────────── */}
            {hasResult && (
              <div
                ref={answerRef}
                className="mt-6 border border-[#111111] bg-white p-7 shadow-[8px_8px_0px_0px_#111111]"
              >
                {/* Loading state */}
                {status === "submitting" && (
                  <div role="status" className="flex items-center gap-2 text-[#555555]">
                    <Loader2 size={16} className="animate-spin text-[#0047FF]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                      Searching knowledge embeddings & generating response…
                    </span>
                  </div>
                )}

                {/* Streaming / done answer text with Enhanced Markdown Presentation */}
                {(status === "streaming" || status === "done") && answer && (
                  <div
                    role="region"
                    aria-label="Answer"
                    aria-live="polite"
                    aria-atomic="false"
                    aria-busy={status === "streaming"}
                    className="text-[15px] leading-relaxed text-[#222222]"
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ ...props }) => (
                          <h1 className="mt-4 mb-2 font-display text-2xl font-bold uppercase tracking-tight text-[#111111] border-b border-[#111111]/15 pb-1" {...props} />
                        ),
                        h2: ({ ...props }) => (
                          <h2 className="mt-4 mb-2 font-display text-xl font-bold uppercase tracking-tight text-[#111111] border-b border-[#111111]/10 pb-1" {...props} />
                        ),
                        h3: ({ ...props }) => (
                          <h3 className="mt-3 mb-1.5 font-display text-base font-bold uppercase tracking-tight text-[#111111]" {...props} />
                        ),
                        p: ({ ...props }) => (
                          <p className="mb-3 leading-relaxed text-[#333333]" {...props} />
                        ),
                        ul: ({ ...props }) => (
                          <ul className="my-3 list-disc list-outside pl-5 space-y-1.5 text-[#333333]" {...props} />
                        ),
                        ol: ({ ...props }) => (
                          <ol className="my-3 list-decimal list-outside pl-5 space-y-1.5 text-[#333333]" {...props} />
                        ),
                        li: ({ ...props }) => (
                          <li className="leading-relaxed" {...props} />
                        ),
                        blockquote: ({ ...props }) => (
                          <blockquote className="my-4 border-l-4 border-[#0047FF] bg-[#F9F8F6] p-3 italic text-[#444444]" {...props} />
                        ),
                        h4: ({ ...props }) => (
                          <h4 className="mt-3 mb-1 font-display text-lg font-semibold uppercase text-[#111111]" {...props} />
                        ),
                        h5: ({ ...props }) => (
                          <h5 className="mt-2 mb-1 text-base font-medium uppercase text-[#111111]" {...props} />
                        ),
                        h6: ({ ...props }) => (
                          <h6 className="mt-2 mb-0.5 text-sm font-medium uppercase text-[#111111]" {...props} />
                        ),
                        strong: ({ ...props }) => (
                          <strong className="font-bold text-[#111111]" {...props} />
                        ),
                        // img mapping removed to disallow external images
                        code: ({ className, children, ...props }) => {
                          const isBlock = className?.includes("language-") || String(children).includes("\n");
                          if (isBlock) {
                            return (
                              <pre className="my-3 overflow-x-auto border border-[#111111] bg-[#111111] p-3 text-xs text-[#F9F8F6] font-mono">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            );
                          }
                          return (
                            <code className="border border-[#111111]/20 bg-[#F2EFE9] px-1.5 py-0.5 text-xs font-mono font-medium text-[#111111]" {...props}>
                              {children}
                            </code>
                          );
                        },
                        table: ({ ...props }) => (
                          <div className="my-4 overflow-x-auto border border-[#111111]">
                            <table className="w-full text-left text-xs" {...props} />
                          </div>
                        ),
                        thead: ({ ...props }) => (
                          <thead className="border-b border-[#111111] bg-[#F2EFE9] text-[#111111] font-bold uppercase tracking-wider" {...props} />
                        ),
                        th: ({ ...props }) => (
                          <th className="px-3 py-2 font-bold" {...props} />
                        ),
                        td: ({ ...props }) => (
                          <td className="border-t border-[#111111]/15 px-3 py-2 text-[#333333]" {...props} />
                        ),
                        a: ({ ...props }) => (
                          <a className="font-semibold text-[#0047FF] underline hover:text-[#0036CC]" target="_blank" rel="noreferrer" {...props} />
                        ),
                      }}
                    >
                      {answer}
                    </ReactMarkdown>

                    {/* Blinking cursor during streaming */}
                    {status === "streaming" && (
                      <span
                        aria-hidden="true"
                        className="ml-1 inline-block h-[1.1em] w-1.5 translate-y-[2px] bg-[#0047FF] align-middle animate-pulse"
                      />
                    )}
                  </div>
                )}

                {/* Error banner */}
                {status === "done" && errorKind !== null && (
                  <div
                    role="alert"
                    className={`flex items-start gap-2.5 ${answer ? "mt-5 border-t border-[#111111]/15 pt-5" : ""}`}
                  >
                    <AlertCircle
                      size={16}
                      className={`mt-0.5 shrink-0 ${
                        errorKind === "rate-limited"
                          ? "text-[#F0B429]"
                          : "text-red-600"
                      }`}
                    />
                    <div>
                      {errorKind === "rate-limited" && (
                        <p className="text-xs font-bold text-[#F0B429]">
                          RATE LIMIT REACHED.{" "}
                          {(() => {
                            const mins = extractRetryMinutes(errorMessage);
                            return mins !== null
                              ? `TRY AGAIN IN ~${mins} MINUTE${mins === 1 ? "" : "S"}.`
                              : "PLEASE TRY AGAIN LATER.";
                          })()}
                        </p>
                      )}
                      {errorKind === "validation" && (
                        <p className="text-xs font-bold text-red-600">
                          {errorMessage
                            .replace(/^\[rag\/retrieval\]\s*Validation failed:\s*/i, "")
                            .replace(/^\[rag\/.*?\]\s*/i, "")}
                        </p>
                      )}
                      {errorKind === "generic" && (
                        <p className="text-xs font-bold text-red-600">
                          AN UNEXPECTED ERROR OCCURRED. PLEASE TRY AGAIN.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Trace viewer — toggle and details */}
                {status === "done" && (activityEvents.length > 0 || toolEvents.length > 0 || traceInfo) && (
                  <div className="mt-5 border-t border-[#111111]/15 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowTrace((s) => !s)}
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#555555] transition-colors hover:text-[#0047FF]"
                      aria-expanded={showTrace}
                      aria-controls="trace-viewer"
                      aria-label="Toggle trace viewer"
                    >
                      {showTrace ? "Hide Observability Trace" : "View Observability Trace"}
                    </button>
                    {showTrace && (
                      <div id="trace-viewer" className="mt-3 border border-[#111111]/20 bg-[#F9F8F6] p-4 text-xs font-mono text-[#444444]">
                        {/* Trace Summary */}
                        {traceInfo && (
                          <div className="border-b border-[#111111]/15 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#111111]">Trace ID:</span>
                              <code className="border border-[#111111]/20 bg-white px-1.5 py-0.5">{traceInfo.traceId.slice(0, 10)}…</code>
                              <button
                                type="button"
                                onClick={() => navigator.clipboard.writeText(traceInfo.traceId)}
                                className="font-bold text-[#0047FF] hover:underline"
                                aria-label="Copy trace ID"
                              >
                                Copy
                              </button>
                            </div>
                            <div className="mt-1">Total Duration: {traceInfo.overallDurationMs} ms</div>
                            {traceInfo.stageDurations && (
                              <div className="mt-1 text-[11px] text-[#666666]">
                                {Object.entries(traceInfo.stageDurations).map(([stage, ms]) => (
                                  <div key={stage}>{stage}: {ms} ms</div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Activity Timeline */}
                        {activityEvents.length > 0 && (
                          <div className="border-b border-[#111111]/15 py-2">
                            <div className="font-bold text-[#111111] uppercase tracking-wider mb-1">Stage Activity</div>
                            <ul className="space-y-1">
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
                                <li key={item.stage} className="flex items-center gap-2">
                                  <span className="inline-block h-1.5 w-1.5 bg-[#0047FF]" />
                                  <span className="font-semibold text-[#111111]">{item.stage}</span>: {item.status}
                                  {item.duration !== undefined && <span className="text-[#666666]">({item.duration} ms)</span>}
                                  {item.error && <span className="font-bold text-red-600"> – error: {item.error}</span>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Tool Activity */}
                        {toolEvents.length > 0 && (
                          <div className="pt-2">
                            <div className="font-bold text-[#111111] uppercase tracking-wider mb-1">Tool Executions</div>
                            <ul className="space-y-1">
                              {toolEvents.map((t, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <span className="inline-block h-1.5 w-1.5 bg-[#0047FF]" />
                                  <span className="font-semibold text-[#111111]">{t.name}</span>: {t.status} ({t.durationMs} ms)
                                  {t.errorCode && <span className="font-bold text-red-600"> – error: {t.errorCode}</span>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Sources disclosure */}
                {status === "done" && sources.length > 0 && errorKind === null && (
                  <div className="mt-5 border-t border-[#111111]/15 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowSources((s) => !s)}
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#555555] transition-colors hover:text-[#0047FF]"
                      aria-expanded={showSources}
                      aria-controls="ask-sources-list"
                    >
                      {showSources ? (
                        <ChevronUp size={13} />
                      ) : (
                        <ChevronDown size={13} />
                      )}
                      {showSources ? "Hide" : "View"} Grounding Sources (
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
          </div>
        </div>
      </div>
    </section>
  );
}
