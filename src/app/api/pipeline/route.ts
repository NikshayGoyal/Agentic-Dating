import { NextRequest, NextResponse } from 'next/server';
import { scrapeProfile } from '@/lib/scraper';
import { analyzeProfile } from '@/lib/agents/analyzer';
import { createPerson, createProfile, updatePersonData, getAllPeople } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { linkedinUrl, instagramUrl, name: providedName, category } = body;

    if (!linkedinUrl || !instagramUrl) {
      return NextResponse.json(
        { error: 'linkedinUrl and instagramUrl are required' },
        { status: 400 }
      );
    }

    // Step 1: Scrape profiles
    console.log(`[Pipeline] Starting scrape for ${linkedinUrl} + ${instagramUrl}`);
    const scrapedData = await scrapeProfile(linkedinUrl, instagramUrl);

    // Determine name from scraped data or provided name
    const name = providedName || 
      scrapedData.linkedin?.name || 
      scrapedData.instagram?.fullName || 
      'Unknown Person';

    const photoUrl = scrapedData.linkedin?.profileImageUrl || 
      scrapedData.instagram?.profilePicUrl || 
      null;

    // Step 2: Create person in database
    let personId = crypto.randomUUID();
    try {
      personId = createPerson({
        name,
        linkedinUrl,
        instagramUrl,
        photoUrl: photoUrl || undefined,
        category,
        linkedinData: scrapedData.linkedin ? JSON.stringify(scrapedData.linkedin) : undefined,
        instagramData: scrapedData.instagram ? JSON.stringify(scrapedData.instagram) : undefined,
      });
    } catch (dbErr) {
      console.warn('[Pipeline] DB createPerson warning:', dbErr);
    }

    // Step 3: Analyze profile with AI
    console.log(`[Pipeline] Analyzing profile for ${name}...`);
    const profile = await analyzeProfile(scrapedData.linkedin, scrapedData.instagram, name);

    // Step 4: Save profile
    try {
      createProfile(personId, profile);
    } catch (dbErr) {
      console.warn('[Pipeline] DB createProfile warning:', dbErr);
    }

    console.log(`[Pipeline] Complete for ${name} (${profile.personalityType})`);

    return NextResponse.json({
      success: true,
      personId,
      name,
      profile,
      scrapedData: {
        linkedinFound: !!scrapedData.linkedin,
        instagramFound: !!scrapedData.instagram,
        errors: scrapedData.errors,
      },
    });
  } catch (error) {
    console.error('Pipeline error:', error);
    return NextResponse.json(
      { error: 'Pipeline failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
