import { callGPT4oMini } from '@/lib/openai';
import { getDatesByPersonId, createRanking, getAllPeople, getProfileByPersonId, getPersonById } from '@/lib/db';

export async function generateRankings(personIds: string[]): Promise<void> {
  console.log(`[Ranker] Generating rankings for ${personIds.length} people...`);

  for (const personId of personIds) {
    const dates = getDatesByPersonId(personId);
    if (dates.length === 0) continue;

    // Collect all dates and their scores
    const datePartners: Map<string, { chemistryScore: number; messages: unknown[]; highlights: string | null; partnerName: string }> = new Map();

    for (const date of dates) {
      const d = date as { person1_id: string; person2_id: string; chemistry_score: number; messages: unknown[]; highlights: string | null; person1_name: string; person2_name: string };
      const partnerId = d.person1_id === personId ? d.person2_id : d.person1_id;
      const partnerName = d.person1_id === personId ? d.person2_name : d.person1_name;
      
      // Take the best date score if multiple dates exist
      const existing = datePartners.get(partnerId);
      if (!existing || d.chemistry_score > existing.chemistryScore) {
        datePartners.set(partnerId, {
          chemistryScore: d.chemistry_score,
          messages: d.messages,
          highlights: d.highlights,
          partnerName,
        });
      }
    }

    // Sort by chemistry score
    const sorted = Array.from(datePartners.entries())
      .sort((a, b) => b[1].chemistryScore - a[1].chemistryScore);

    // Generate compatibility reports for each match
    const person = getPersonById(personId) as { name: string } | undefined;
    if (!person) continue;

    const personProfile = getProfileByPersonId(personId);

    for (let i = 0; i < sorted.length; i++) {
      const [partnerId, dateData] = sorted[i];
      const partnerProfile = getProfileByPersonId(partnerId);
      
      try {
        const report = await generateCompatibilityReport(
          person.name,
          personProfile,
          dateData.partnerName,
          partnerProfile,
          dateData.chemistryScore,
          dateData.highlights || ''
        );

        createRanking({
          personId,
          rankedPersonId: partnerId,
          rank: i + 1,
          overallScore: dateData.chemistryScore,
          headline: report.headline,
          summary: report.summary,
          sharedInterests: report.sharedInterests,
          complementaryTraits: report.complementaryTraits,
          potentialFriction: report.potentialFriction,
          bestDateIdea: report.bestDateIdea,
        });

        console.log(`[Ranker] ${person.name} → #${i + 1}: ${dateData.partnerName} (${dateData.chemistryScore}%)`);
      } catch (error) {
        console.error(`Ranking error for ${person.name} → ${dateData.partnerName}:`, error);
        
        // Create a basic ranking even if report generation fails
        createRanking({
          personId,
          rankedPersonId: partnerId,
          rank: i + 1,
          overallScore: dateData.chemistryScore,
          headline: dateData.chemistryScore > 75 ? 'Strong Connection' : dateData.chemistryScore > 50 ? 'Worth Exploring' : 'Different Paths',
          summary: `Chemistry score: ${dateData.chemistryScore}%. ${dateData.highlights || 'An interesting pairing.'}`,
          sharedInterests: [],
          complementaryTraits: [],
          potentialFriction: [],
          bestDateIdea: 'A casual meetup to explore the connection further',
        });
      }
    }
  }

  console.log(`[Ranker] Rankings complete for all ${personIds.length} people.`);
}

async function generateCompatibilityReport(
  person1Name: string,
  person1Profile: ReturnType<typeof getProfileByPersonId>,
  person2Name: string,
  person2Profile: ReturnType<typeof getProfileByPersonId>,
  chemistryScore: number,
  highlights: string
): Promise<{
  headline: string;
  summary: string;
  sharedInterests: string[];
  complementaryTraits: string[];
  potentialFriction: string[];
  bestDateIdea: string;
}> {
  const p1 = person1Profile as Record<string, unknown> | null;
  const p2 = person2Profile as Record<string, unknown> | null;

  const systemPrompt = `You are a dating compatibility analyst. Generate a fun, insightful compatibility report for a match.

Respond as JSON:
{
  "headline": "A catchy 2-4 word match headline (e.g., 'The Power Couple', 'Slow Burn Potential', 'Opposites Attract', 'Chaotic Good Energy')",
  "summary": "2-3 sentences about their compatibility — vivid, specific, fun to read",
  "sharedInterests": ["3 things they have in common"],
  "complementaryTraits": ["3 ways they balance each other"],
  "potentialFriction": ["2-3 potential friction points"],
  "bestDateIdea": "A specific, creative date idea perfect for this pair"
}`;

  const getField = (obj: Record<string, unknown> | null, ...keys: string[]) => {
    if (!obj) return 'N/A';
    for (const k of keys) {
      if (obj[k] !== undefined && obj[k] !== null) {
        return Array.isArray(obj[k]) ? (obj[k] as string[]).join(', ') : String(obj[k]);
      }
    }
    return 'N/A';
  };

  const userPrompt = `Match Analysis:

Person 1: ${person1Name}
Personality: ${getField(p1, 'personality_type', 'personalityType')}
Traits: ${getField(p1, 'traits')}
Hobbies: ${getField(p1, 'hobbies')}
Values: ${getField(p1, 'values_list', 'values')}
Looking for: ${getField(p1, 'looking_for', 'lookingFor')}

Person 2: ${person2Name}
Personality: ${getField(p2, 'personality_type', 'personalityType')}
Traits: ${getField(p2, 'traits')}
Hobbies: ${getField(p2, 'hobbies')}
Values: ${getField(p2, 'values_list', 'values')}
Looking for: ${getField(p2, 'looking_for', 'lookingFor')}

Chemistry Score from their date: ${chemistryScore}%
Date Highlights: ${highlights}

Generate their compatibility report.`;

  const response = await callGPT4oMini(systemPrompt, userPrompt, true);
  const parsed = JSON.parse(response);

  return {
    headline: parsed.headline || 'Interesting Match',
    summary: parsed.summary || 'These two have potential worth exploring.',
    sharedInterests: Array.isArray(parsed.sharedInterests) ? parsed.sharedInterests : [],
    complementaryTraits: Array.isArray(parsed.complementaryTraits) ? parsed.complementaryTraits : [],
    potentialFriction: Array.isArray(parsed.potentialFriction) ? parsed.potentialFriction : [],
    bestDateIdea: parsed.bestDateIdea || 'A creative date that brings out both their personalities',
  };
}
