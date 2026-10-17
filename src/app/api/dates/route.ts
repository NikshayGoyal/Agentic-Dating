import { NextResponse } from 'next/server';
import { getAllDates } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dates = getAllDates();
    return NextResponse.json({ dates });
  } catch (error) {
    console.error('GET /api/dates error:', error);
    return NextResponse.json({ error: 'Failed to fetch dates' }, { status: 500 });
  }
}
