// app/api/jdfit/admin/delete/route.ts
import { NextResponse, NextRequest } from 'next/server.js';
import { verifySessionToken } from '../../../../../lib/jdfit/admin.ts';
import { deleteSubmission } from '../../../../../lib/jdfit/db.ts';

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get('jdfit_admin_token')?.value;
  if (!token || !verifySessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const deletedId = await deleteSubmission(id);
    if (!deletedId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ deletedId }, { status: 200 });
  } catch (e) {
    console.error('Delete error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
