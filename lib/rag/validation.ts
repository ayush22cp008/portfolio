/**
 * Question validation for Phase 3 retrieval.
 *
 * Validates the retrieval input shape and content.
 * All validation is deterministic and server-side.
 *
 * SECURITY: The client cannot inject SQL, RPC names, table names,
 * or any other database identifiers through this validation.
 */

import { RAG_CONFIG } from "./config";

export interface ValidationResult {
  valid: boolean;
  question: string;
  error?: string;
}

/**
 * Validate a retrieval question.
 *
 * @param input - The raw input to validate (expected: { question: string })
 * @returns ValidationResult with the validated question or an error message
 */
export function validateQuestion(input: unknown): ValidationResult {
  // Check that input is an object
  if (input === null || typeof input !== "object") {
    return {
      valid: false,
      question: "",
      error: 'Input must be an object with a "question" field.',
    };
  }

  // Check that question field exists
  const question = (input as Record<string, unknown>).question;
  if (question === undefined || question === null) {
    return {
      valid: false,
      question: "",
      error: 'Missing required field: "question".',
    };
  }

  // Check that question is a string
  if (typeof question !== "string") {
    return {
      valid: false,
      question: "",
      error: 'Field "question" must be a string.',
    };
  }

  // Trim and check for empty/whitespace-only
  const trimmed = question.trim();
  if (trimmed.length === 0) {
    return {
      valid: false,
      question: "",
      error: "Question cannot be empty or whitespace-only.",
    };
  }

  // Check maximum length
  if (trimmed.length > RAG_CONFIG.maxQuestionLength) {
    return {
      valid: false,
      question: "",
      error: `Question exceeds maximum length of ${RAG_CONFIG.maxQuestionLength} characters.`,
    };
  }

  return {
    valid: true,
    question: trimmed,
  };
}
