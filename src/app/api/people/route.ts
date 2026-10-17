import { NextRequest, NextResponse } from 'next/server';
import { createPerson, getAllPeople, getPersonById, getAllProfiles, getStats } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const people = getAllProfiles();
    const stats = getStats();
    return NextResponse.json({ people, stats });
  } catch (error) {
    console.error('GET /api/people error:', error);
    return NextResponse.json({ error: 'Failed to fetch people' }, { status: 500 });
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
  } catch (error) {
    console.error('POST /api/people error:', error);
    return NextResponse.json({ error: 'Failed to create person' }, { status: 500 });
  }
}
