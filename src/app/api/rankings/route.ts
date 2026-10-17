import { NextRequest, NextResponse } from 'next/server';
import { getRankingsByPersonId, getAllRankings } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const personId = request.nextUrl.searchParams.get('personId');
    
    if (personId) {
      const rankings = getRankingsByPersonId(personId);
      return NextResponse.json({ rankings });
    }
    
    const rankings = getAllRankings();
    return NextResponse.json({ rankings });
  } catch (error) {
    console.error('GET /api/rankings error:', error);
    return NextResponse.json({ error: 'Failed to fetch rankings' }, { status: 500 });
  }
}
