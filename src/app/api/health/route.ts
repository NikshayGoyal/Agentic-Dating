import { NextResponse } from 'next/server';
import { getAllProfiles, getStats } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const people = getAllProfiles();
    const stats = getStats();
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      peopleCount: people.length,
      stats,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown';
    return NextResponse.json({
      status: 'error',
      error: msg,
    });
  }
}
