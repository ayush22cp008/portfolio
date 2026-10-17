// app/api/jdfit/admin/data/route.ts

import { NextResponse, NextRequest } from 'next/server.js';
import { verifySessionToken } from '../../../../../lib/jdfit/admin.ts';
import { getSkillAggregates, getCounters, getSubmissions } from '../../../../../lib/jdfit/db.ts';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('jdfit_admin_token')?.value;
  if (!token || !verifySessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [skillAggregates, counters, submissions] = await Promise.all([
    getSkillAggregates(),
    getCounters(),
    getSubmissions(),
  ]);

  return NextResponse.json({ skillAggregates, counters, submissions });
}
