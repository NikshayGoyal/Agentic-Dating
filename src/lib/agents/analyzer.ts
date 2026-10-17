import { callGPT4o } from '@/lib/openai';
import type { LinkedInData, InstagramData, PersonProfile } from '@/lib/types';

const ANALYZER_SYSTEM_PROMPT = `You are an expert dating coach and personality psychologist. You analyze a person's professional and social media presence to build a deep personality profile for a dating context.

You receive data scraped from someone's LinkedIn and Instagram profiles. From this data, you must infer their personality, interests, dating preferences, and social style.

IMPORTANT RULES:
- Be SPECIFIC and CREATIVE. Never use generic descriptions like "loves travel and trying new restaurants."
- The personalityType should be a catchy 2-4 word archetype (e.g., "The Midnight Philosopher", "The Chaos Coordinator", "The Ambitious Dreamer", "The Gentle Disruptor")
- The icebreaker should be what THIS specific person would actually say to start a conversation on a first date — make it creative and character-specific
- The controversialTake should be a spicy but plausible opinion inferred from their content and industry
- LookingFor should feel like a genuine inference, not a wish list
- All arrays should have 3-5 items each, never more
- Summary should be 2-3 sentences, vivid and memorable

Respond with a JSON object matching this exact schema:
{
  "tagline": "One sentence that captures their essence",
  "personalityType": "The [Catchy Archetype]",
  "traits": ["trait1", "trait2", "trait3", "trait4"],
  "communicationStyle": "How they communicate in conversation",
  "humorType": "Their specific humor style",
  "hobbies": ["hobby1", "hobby2", "hobby3"],
  "passions": ["passion1", "passion2", "passion3"],
  "values": ["value1", "value2", "value3"],
  "lookingFor": "What they'd want in a partner, inferred from their personality",
  "greenFlags": ["what they'd appreciate1", "what they'd appreciate2", "what they'd appreciate3"],
  "dealbreakers": ["dealbreaker1", "dealbreaker2", "dealbreaker3"],
  "idealDate": "A specific, creative date scenario perfect for them",
  "icebreaker": "Their opening line on a first date",
  "controversialTake": "A spicy opinion they'd likely hold",
  "summary": "2-3 vivid sentences summarizing who they are as a dating prospect"
}`;

export async function analyzeProfile(
  linkedinData: LinkedInData | null,
  instagramData: InstagramData | null,
  personName: string
): Promise<PersonProfile> {
  const userPrompt = buildUserPrompt(linkedinData, instagramData, personName);
  
  try {
    const response = await callGPT4o(ANALYZER_SYSTEM_PROMPT, userPrompt, true);
    const parsed = JSON.parse(response);
    
    // Validate and ensure all required fields exist
    return {
      tagline: parsed.tagline || `${personName} — ready to connect`,
      personalityType: parsed.personalityType || 'The Enigma',
      traits: ensureArray(parsed.traits, 4),
      communicationStyle: parsed.communicationStyle || 'Warm and engaging',
      humorType: parsed.humorType || 'Quick-witted with a dry edge',
      hobbies: ensureArray(parsed.hobbies, 3),
      passions: ensureArray(parsed.passions, 3),
      values: ensureArray(parsed.values, 3),
      lookingFor: parsed.lookingFor || 'Someone who matches their energy and depth',
      greenFlags: ensureArray(parsed.greenFlags, 3),
      dealbreakers: ensureArray(parsed.dealbreakers, 3),
      idealDate: parsed.idealDate || 'A spontaneous adventure that sparks real conversation',
      icebreaker: parsed.icebreaker || "So, what's the most interesting thing you've done this week?",
      controversialTake: parsed.controversialTake || 'The best ideas come from people who disagree with you',
      summary: parsed.summary || `${personName} brings a unique energy to any room they walk into.`,
    };
  } catch (error) {
    console.error('Profile analysis error:', error);
    // Return a fallback profile
    return generateFallbackProfile(personName, linkedinData, instagramData);
  }
}

function buildUserPrompt(
  linkedin: LinkedInData | null,
  instagram: InstagramData | null,
  name: string
): string {
  let prompt = `Analyze this person and create their dating profile:\n\n`;
  prompt += `**Name:** ${name}\n\n`;

  if (linkedin) {
    prompt += `**LinkedIn Profile:**\n`;
    prompt += `- Headline: ${linkedin.headline}\n`;
    prompt += `- About: ${linkedin.about}\n`;
    prompt += `- Location: ${linkedin.location}\n`;
    prompt += `- Current Role: ${linkedin.currentRole} at ${linkedin.company}\n`;
    if (linkedin.skills.length > 0) {
      prompt += `- Skills: ${linkedin.skills.join(', ')}\n`;
    }
    if (linkedin.experience.length > 0) {
      prompt += `- Experience:\n`;
      for (const exp of linkedin.experience.slice(0, 5)) {
        prompt += `  • ${exp.title} at ${exp.company} (${exp.duration})\n`;
      }
    }
    if (linkedin.education.length > 0) {
      prompt += `- Education:\n`;
      for (const edu of linkedin.education) {
        prompt += `  • ${edu.degree} from ${edu.school}\n`;
      }
    }
    prompt += '\n';
  } else {
    prompt += `**LinkedIn:** Not available\n\n`;
  }

  if (instagram) {
    prompt += `**Instagram Profile (@${instagram.username}):**\n`;
    prompt += `- Bio: ${instagram.bio}\n`;
    prompt += `- Followers: ${instagram.followerCount.toLocaleString()}\n`;
    prompt += `- Following: ${instagram.followingCount.toLocaleString()}\n`;
    prompt += `- Posts: ${instagram.postCount}\n`;
    if (instagram.recentCaptions.length > 0) {
      prompt += `- Recent Post Captions:\n`;
      for (const caption of instagram.recentCaptions.slice(0, 8)) {
        prompt += `  • "${caption.slice(0, 200)}"\n`;
      }
    }
    prompt += '\n';
  } else {
    prompt += `**Instagram:** Not available\n\n`;
  }

  prompt += `Based on all available information, create a rich, specific dating profile for ${name}. Be creative and insightful — go beyond surface-level observations.`;
  
  return prompt;
}

function ensureArray(val: unknown, minLength: number): string[] {
  if (!Array.isArray(val)) return Array(minLength).fill('Unknown');
  if (val.length < minLength) {
    return [...val, ...Array(minLength - val.length).fill('Curious')].slice(0, minLength);
  }
  return val.map(String);
}

function generateFallbackProfile(
  name: string,
  linkedin: LinkedInData | null,
  instagram: InstagramData | null
): PersonProfile {
  const headline = linkedin?.headline || '';
  const bio = instagram?.bio || '';
  
  return {
    tagline: headline || bio || `${name} — full of surprises`,
    personalityType: 'The Enigma',
    traits: ['curious', 'driven', 'authentic', 'thoughtful'],
    communicationStyle: 'Direct but warm',
    humorType: 'Observational with a self-aware edge',
    hobbies: ['exploring new ideas', 'connecting with interesting people', 'learning'],
    passions: ['making an impact', 'personal growth', 'creativity'],
    values: ['authenticity', 'ambition', 'empathy'],
    lookingFor: 'Someone who challenges them intellectually and makes them laugh',
    greenFlags: ['intellectual curiosity', 'emotional intelligence', 'sense of humor'],
    dealbreakers: ['dishonesty', 'close-mindedness', 'lack of ambition'],
    idealDate: 'A rooftop dinner with incredible conversation and an unexpected adventure afterwards',
    icebreaker: `Hi! I'm ${name}. Quick question — what's something you're irrationally passionate about?`,
    controversialTake: 'The best relationships start with a good debate',
    summary: `${name} brings a unique combination of drive and warmth. They're the kind of person who lights up a room while making everyone in it feel seen.`,
  };
}
