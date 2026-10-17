// Seed script — run with: npx tsx scripts/seed.ts
// This loads 27 seed people into the database with AI-analyzed profiles

import { createPerson, createProfile, getDb } from '../src/lib/db';
import { analyzeProfile } from '../src/lib/agents/analyzer';
import { scrapeProfile } from '../src/lib/scraper';
import seedPeople from '../data/seed-people.json';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function seed() {
  console.log(`\n🌱 Seeding database with ${seedPeople.length} people...\n`);
  
  // Initialize DB
  getDb();
  
  let success = 0;
  let failed = 0;

  for (let i = 0; i < seedPeople.length; i++) {
    const person = seedPeople[i];
    console.log(`[${i + 1}/${seedPeople.length}] Processing ${person.name}...`);

    try {
      // Try to scrape (may fail — that's OK, we'll use AI with minimal data)
      let scrapedData;
      try {
        scrapedData = await scrapeProfile(person.linkedinUrl, person.instagramUrl);
      } catch (e) {
        console.log(`  ⚠️ Scraping failed, using name-only analysis`);
        scrapedData = { linkedin: null, instagram: null, scrapedAt: new Date().toISOString(), errors: ['Scraping failed'] };
      }

      // Create person
      const personId = createPerson({
        name: person.name,
        linkedinUrl: person.linkedinUrl,
        instagramUrl: person.instagramUrl,
        photoUrl: scrapedData.linkedin?.profileImageUrl || scrapedData.instagram?.profilePicUrl || undefined,
        category: person.category,
        linkedinData: scrapedData.linkedin ? JSON.stringify(scrapedData.linkedin) : undefined,
        instagramData: scrapedData.instagram ? JSON.stringify(scrapedData.instagram) : undefined,
      });

      // Analyze profile with AI
      const profile = await analyzeProfile(
        scrapedData.linkedin,
        scrapedData.instagram,
        person.name
      );

      // Save profile
      createProfile(personId, profile);

      console.log(`  ✅ ${person.name} → "${profile.personalityType}"`);
      success++;

      // Rate limit: wait between API calls
      await sleep(500);
    } catch (error) {
      console.error(`  ❌ Failed: ${error}`);
      failed++;
    }
  }

  console.log(`\n🎉 Seeding complete!`);
  console.log(`   ✅ ${success} people added`);
  console.log(`   ❌ ${failed} failed\n`);
}

seed().catch(console.error);
