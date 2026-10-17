// Updated imports with exportable variables for testing
import { NextResponse } from 'next/server.js';
// Lazy import of analyzeJobDescription inside POST to respect MOCK_ANALYSIS env
import { insertSubmission as originalInsertSubmission, incrementCounter } from '../../../lib/jdfit/db.ts';
import { applyAnonAnalytics as originalApplyAnonAnalytics } from '../../../lib/jdfit/analytics.ts';
import { analyzeJobDescription } from '../../../lib/jdfit/analyze.ts';
import { checkRateLimits } from '../../../lib/rag/rate-limit.ts';

// Export mutable references for tests
export let insertSubmission = originalInsertSubmission;
export let applyAnonAnalytics = originalApplyAnonAnalytics;

/**
 * Set mock handlers for testing.
 * Allows tests to replace the DB and analytics functions.
 */
export function setHandlers({ insertSubmission: newInsert, applyAnonAnalytics: newApply }: { insertSubmission: typeof originalInsertSubmission; applyAnonAnalytics: typeof originalApplyAnonAnalytics; }) {
  insertSubmission = newInsert;
  applyAnonAnalytics = newApply;
}

/**
 * Payload shape for skill aggregates passed to analytics.
 */
interface SkillAggregatePayload {
  skillKey: string;
  displayLabel: string;
  category: string;
  required: number;
  preferred: number;
  strong: number;
  partial: number;
  gap: number;
  insufficient: number;
}

/**
 * Build skill aggregates from analysis, deduplicating and skipping sentence‑like keys.
 * Returns an array of SkillAggregatePayload ready for applyAnonAnalytics.
 */
import type { JdAnalysis } from '../../../lib/jdfit/types';
export function buildAggregates(analysis: JdAnalysis): SkillAggregatePayload[] {
  const aggregatesMap = new Map<string, SkillAggregatePayload>();
  for (const req of analysis.requirements) {
    const skillKey = req.normalized;
    // Skip non‑canonical keys (e.g., full sentences containing spaces)
    if (skillKey.includes(' ')) continue;
    const weight = req.priority === 'required' ? 2 : 1;
    const classification = analysis.classifications[skillKey];
    const existing = aggregatesMap.get(skillKey);
    if (existing) {
      existing.required += req.priority === 'required' ? weight : 0;
      existing.preferred += req.priority === 'preferred' ? weight : 0;
      existing.strong += classification === 'strong_match' ? weight : 0;
      existing.partial += classification === 'partial_match' ? weight : 0;
      existing.gap += classification === 'gap' ? weight : 0;
      existing.insufficient += classification === 'insufficient_evidence' ? weight : 0;
    } else {
      aggregatesMap.set(skillKey, {
        skillKey,
        displayLabel: (() => { const map: Record<string, string> = { python: 'Python', sql: 'SQL', pytorch: 'PyTorch', docker: 'Docker' }; return map[skillKey] ?? skillKey.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()); })(),
        category: 'skill',
        required: req.priority === 'required' ? weight : 0,
        preferred: req.priority === 'preferred' ? weight : 0,
        strong: classification === 'strong_match' ? weight : 0,
        partial: classification === 'partial_match' ? weight : 0,
        gap: classification === 'gap' ? weight : 0,
        insufficient: classification === 'insufficient_evidence' ? weight : 0,
      });
    }
  }
  return Array.from(aggregatesMap.values());
}

export async function POST(request: Request) {
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
  // Rate limit check (per‑IP and global)
  const rateResult = await checkRateLimits(clientIp);
  if (!rateResult.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try later.' }, { status: 429 });
  }

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
  }

interface JdFitRequestBody {
  jobDescription?: string;
  company?: string;
  jobTitle?: string;
  email?: string;
  consentFull?: boolean;
  consentAnon?: boolean;
}

// Duplicate SkillAggregatePayload interface removed

  let body: JdFitRequestBody;
  try {
    body = (await request.json()) as JdFitRequestBody;
  } catch {
    return NextResponse.json({ error: 'Malformed JSON' }, { status: 400 });
  }

  const { jobDescription, company, jobTitle, email, consentFull, consentAnon } = body ?? {};
  if (!jobDescription || typeof jobDescription !== 'string') {
    return NextResponse.json({ error: 'jobDescription is required' }, { status: 400 });
  }
  if (jobDescription.length > 10000) {
    return NextResponse.json({ error: 'Job description exceeds 10,000 characters' }, { status: 400 });
  }

  // Perform analysis (always executed, even if no consent)
  let analysis;
  try {
    analysis = await analyzeJobDescription(jobDescription);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Validate that there are extracted requirements before proceeding with analytics consent
  if (consentAnon && (!analysis.requirements || analysis.requirements.length === 0)) {
    return NextResponse.json({ error: 'No requirements extracted' }, { status: 400 });
  }

  // Prepare response meta (echo supplied optional fields)
  const meta = { company: company ?? null, jobTitle: jobTitle ?? null, email: email ?? null };

  // Persistence based on consent flags
  if (consentFull) {
    await insertSubmission({
      jobDescription,
      company: company ?? null,
      jobTitle: jobTitle ?? null,
      email: email ?? null,
      analysis,
    });

  }

    if (consentAnon) {
      const aggregates = buildAggregates(analysis);
      await applyAnonAnalytics(aggregates, {
        company: !!company,
        jobTitle: !!jobTitle,
        email: !!email,
      });
    }





  const result = { analysis, meta };
  return NextResponse.json(result);
}
