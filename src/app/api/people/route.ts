import { NextRequest, NextResponse } from 'next/server';
import { createPerson, getAllPeople, getPersonById, getAllProfiles, getStats } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const people = getAllProfiles();
    const stats = getStats();
    return NextResponse.json({ people, stats });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('GET /api/people error:', message);
    return NextResponse.json({
      people: [],
      stats: { people: 0, profiles: 0, dates: 0, rankings: 0 },
      error: message
    }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, linkedinUrl, instagramUrl, category, photoUrl } = body;

    if (!name || !linkedinUrl || !instagramUrl) {
      return NextResponse.json(
        { error: 'name, linkedinUrl, and instagramUrl are required' },
        { status: 400 }
      );
    }

    const id = createPerson({
      name,
      linkedinUrl,
      instagramUrl,
      photoUrl,
      category,
    });

    const person = getPersonById(id);
    return NextResponse.json({ person, id }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('POST /api/people error:', message);
    return NextResponse.json({ error: 'Failed to create person: ' + message }, { status: 500 });
  }
}
