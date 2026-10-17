// app/api/jdfit/analyze/route.ts

import { NextResponse } from 'next/server';
import { analyzeJobDescription } from '@/lib/jdfit/analyze';
import { checkRateLimits } from '@/lib/rag/rate-limit';

interface AnalyzeRequestBody {
  jobDescription?: string;
}

export async function POST(request: Request) {
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
  let rateResult;
  try {
    rateResult = await checkRateLimits(clientIp);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Rate limit check failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
  if (!rateResult.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try later.' }, { status: 429 });
  }

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
  }

  let body: AnalyzeRequestBody;
  try {
    body = (await request.json()) as AnalyzeRequestBody;
  } catch {
    return NextResponse.json({ error: 'Malformed JSON' }, { status: 400 });
  }

  const { jobDescription } = body ?? {};
  if (!jobDescription || typeof jobDescription !== 'string') {
    return NextResponse.json({ error: 'jobDescription is required' }, { status: 400 });
  }
  if (jobDescription.length > 10000) {
    return NextResponse.json({ error: 'Job description exceeds 10,000 characters' }, { status: 400 });
  }

  try {
    const analysis = await analyzeJobDescription(jobDescription);
    return NextResponse.json({ analysis });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
