// lib/jdfit/analyze.ts

import Groq from "groq-sdk";
import { projects, skillGroups } from "../../corpus/profile/data.ts";
import type { JdAnalysis, JdRequirement } from "./types";

// Environment validation
const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!process.env.MOCK_ANALYSIS && (!GROQ_API_KEY)) {
  throw new Error("[jdfit/analyze] GROQ_API_KEY environment variable is not set.");
}

let groq: any = null;
if (GROQ_API_KEY) {
  groq = new Groq({ apiKey: GROQ_API_KEY });
}

/**
 * System prompt for extracting structured requirements from a job description.
 * The model must return JSON matching the ExtractionResponse interface.
 */
const SYSTEM_PROMPT = `You are a deterministic job‑description analyst.
Extract a list of requirements from the provided job description.
For each requirement output an object with the following fields:
- "text": the exact requirement sentence or phrase.
- "priority": either "required" or "preferred" (if the JD explicitly marks it as optional or "nice to have").
Return a JSON object with a top‑level key "requirements" containing an array of those objects.
If the JD is malformed or exceeds the length limit, respond with an empty array.
Do not hallucinate any requirements. Use ONLY the supplied text.`;

interface ExtractionResponse {
  requirements: Array<{ text: string; priority: "required" | "preferred" }>;
}

/**
 * Normalizes a requirement text to a skill/category token.
 * Simple heuristic: lower‑case, trim, remove punctuation, and match known skill names.
 */
function normalizeRequirement(text: string): string {
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9+\-]/g, " ")
    .trim();
  // Find the longest known skill that appears as a whole word
  const allSkills = skillGroups.flatMap((g) => g.items);
  const match = allSkills.find((skill) => new RegExp(`\\b${skill.toLowerCase()}\\b`).test(cleaned));
  return match ? match.toLowerCase() : cleaned;
}

/**
 * Finds evidence links for a normalized skill.
 * Returns an array of project repo URLs where the skill appears in the stack.
 */
function findEvidenceLinks(normalized: string): string[] {
  const links: string[] = [];
  for (const p of projects) {
    const stackNorm = p.stack.map((s) => s.toLowerCase());
    if (stackNorm.includes(normalized)) {
      links.push(p.repoUrl);
    }
  }
  return links;
}

/**
 * Classify a requirement based on evidence.
 */
function classifyRequirement(req: JdRequirement): {
  classification: "strong_match" | "partial_match" | "gap" | "insufficient_evidence";
  explanation: string;
} {
  const evidence = findEvidenceLinks(req.normalized);
  if (evidence.length > 0) {
    return { classification: "strong_match", explanation: `Evidence found in ${evidence.length} project(s).` };
  }
  // Simple partial heuristic: check if the normalized token appears in any project description
  const descMatch = projects.some((p) => p.description.toLowerCase().includes(req.normalized));
  if (descMatch) {
    return { classification: "partial_match", explanation: "Term appears in project description but not in stack." };
  }
  // If the requirement text is very short or ambiguous, treat as insufficient evidence
  if (req.normalized.split(" ").length <= 1) {
    return { classification: "insufficient_evidence", explanation: "Unable to verify against portfolio evidence." };
  }
  return { classification: "gap", explanation: "No matching evidence in portfolio." };
}

/**
 * Compute the weighted coverage score.
 */
function computeCoverage(requirements: JdRequirement[], classifications: Record<string, string>): number {
  let totalWeight = 0;
  let scoredWeight = 0;
  for (const req of requirements) {
    const weight = req.priority === "required" ? 2 : 1;
    totalWeight += weight;
    const cls = classifications[req.normalized] as "strong_match" | "partial_match" | "gap" | "insufficient_evidence";
    const credit = cls === "strong_match" ? 1 : cls === "partial_match" ? 0.5 : 0;
    scoredWeight += weight * credit;
  }
  if (totalWeight === 0) return 0;
  return Math.round((scoredWeight / totalWeight) * 100);
}

/**
 * Main analysis function.
 */
export async function analyzeJobDescription(jobDescription: string): Promise<JdAnalysis> {
  if (jobDescription.length > 10000) {
    throw new Error("Job description exceeds 10,000 character limit.");
  }

  // Test mode: return mock analysis if environment variable set
  if (process.env.MOCK_ANALYSIS) {
    return JSON.parse(process.env.MOCK_ANALYSIS) as JdAnalysis;
  }

  // Call Groq to extract requirements (non‑streaming).
  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: jobDescription },
    ],
    temperature: 0,
    max_tokens: 1024,
    response_format: { type: "json_object" },
  });

  let parsed: ExtractionResponse;
  try {
    parsed = JSON.parse(response.choices[0].message.content ?? "{\"requirements\":[]}");
  } catch {
    parsed = { requirements: [] };
  }

  // Expand each raw requirement into potentially multiple skill requirements.
  const allSkills = skillGroups.flatMap((g) => g.items);
  function expandRequirement(req: { text: string; priority: 'required' | 'preferred' }): JdRequirement[] {
    const matches = new Set<string>();
    const lowered = req.text.toLowerCase();
    for (const skill of allSkills) {
      const regex = new RegExp(`\\b${skill.toLowerCase()}\\b`);
      if (regex.test(lowered)) {
        matches.add(skill.toLowerCase());
      }
    }
    // If no matches, fall back to whole text normalized.
    if (matches.size === 0) {
      return [{
        text: req.text,
        priority: req.priority,
        normalized: normalizeRequirement(req.text),
      }];
    }
    // Create a requirement entry for each matched skill.
    return Array.from(matches).map((skill) => ({
      text: skill,
      priority: req.priority,
      normalized: skill,
    }));
  }

  const requirements: JdRequirement[] = parsed.requirements.flatMap(expandRequirement);

  const classifications: Record<string, "strong_match" | "partial_match" | "gap" | "insufficient_evidence"> = {};
  const explanations: Record<string, string> = {};

  for (const req of requirements) {
    const { classification, explanation } = classifyRequirement(req);
    classifications[req.normalized] = classification;
    explanations[req.normalized] = explanation;
  }

  const coverageScore = computeCoverage(requirements, classifications);

  return {
    requirements,
    classifications,
    coverageScore,
    explanations,
  };
}
