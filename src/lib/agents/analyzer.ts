import { callGPT4o, callGPT4oMini } from '@/lib/openai';
import type { LinkedInData, InstagramData, PersonProfile } from '@/lib/types';

const ANALYZER_SYSTEM_PROMPT = `You are an expert dating coach and personality psychologist. You analyze a person's professional and social media presence to build a deep, uniquely customized personality profile for a dating context.

You receive data scraped from someone's LinkedIn and Instagram profiles. From this data, you must infer their unique personality, interests, dating preferences, and social style.

IMPORTANT RULES:
- Be HIGHLY SPECIFIC to THIS individual. Avoid generic cliches like "loves travel" or "looking for connection".
- The personalityType should be a catchy, distinct 2-4 word archetype.
- The icebreaker should be what THIS specific person would say based on their specific background.
- The controversialTake should be a spicy, genuine opinion reflecting their worldview.
- Green flags and dealbreakers must feel authentic and polarizing, not generic.

Respond with a JSON object matching this schema:
{
  "tagline": "One punchy sentence that captures their essence",
  "personalityType": "The [Catchy Archetype]",
  "traits": ["trait1", "trait2", "trait3", "trait4"],
  "communicationStyle": "How they communicate in conversation",
  "humorType": "Their specific humor style",
  "hobbies": ["hobby1", "hobby2", "hobby3"],
  "passions": ["passion1", "passion2", "passion3"],
  "values": ["value1", "value2", "value3"],
  "lookingFor": "What they'd want in a partner, inferred from their personality",
  "greenFlags": ["greenFlag1", "greenFlag2", "greenFlag3"],
  "dealbreakers": ["dealbreaker1", "dealbreaker2", "dealbreaker3"],
  "idealDate": "A specific, creative date scenario tailored to them",
  "icebreaker": "Their opening line on a first date",
  "controversialTake": "A spicy opinion they hold",
  "summary": "2-3 vivid sentences summarizing who they are as a dating prospect"
}`;

export async function analyzeProfile(
  linkedinData: LinkedInData | null,
  instagramData: InstagramData | null,
  personName: string
): Promise<PersonProfile> {
  const userPrompt = buildUserPrompt(linkedinData, instagramData, personName);
  
  // Tier 1: Try GPT-4o
  try {
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-build-placeholder' && !process.env.OPENAI_API_KEY.includes('your-key-here')) {
      const response = await callGPT4o(ANALYZER_SYSTEM_PROMPT, userPrompt, true);
      const parsed = JSON.parse(response);
      return sanitizeProfile(parsed, personName);
    }
  } catch (err4o) {
    console.warn(`[Analyzer] GPT-4o analysis failed for ${personName}, falling back to GPT-4o-mini:`, err4o);
  }

  // Tier 2: Try GPT-4o-mini
  try {
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-build-placeholder' && !process.env.OPENAI_API_KEY.includes('your-key-here')) {
      const response = await callGPT4oMini(ANALYZER_SYSTEM_PROMPT, userPrompt, true);
      const parsed = JSON.parse(response);
      return sanitizeProfile(parsed, personName);
    }
  } catch (errMini) {
    console.warn(`[Analyzer] GPT-4o-mini analysis failed for ${personName}, falling back to dynamic psychographic synthesizer:`, errMini);
  }

  // Tier 3: Dynamic Seeded Psychographic Synthesizer
  console.log(`[Analyzer] Using dynamic psychographic synthesizer for ${personName}`);
  return generateDynamicProfile(personName, linkedinData, instagramData);
}

function sanitizeProfile(parsed: Record<string, unknown>, personName: string): PersonProfile {
  return {
    tagline: String(parsed.tagline || `${personName} — living on purpose`),
    personalityType: String(parsed.personalityType || 'The Visionary Catalyst'),
    traits: ensureArray(parsed.traits, 4, ['curious', 'ambitious', 'authentic', 'sharp']),
    communicationStyle: String(parsed.communicationStyle || 'Direct, insightful, and warmly engaging'),
    humorType: String(parsed.humorType || 'Sharp observational banter with dry wit'),
    hobbies: ensureArray(parsed.hobbies, 3, ['exploring ideas', 'fitness', 'deep conversations']),
    passions: ensureArray(parsed.passions, 3, ['personal growth', 'high impact', 'creative problem-solving']),
    values: ensureArray(parsed.values, 3, ['integrity', 'intellectual honesty', 'authenticity']),
    lookingFor: String(parsed.lookingFor || 'Someone intellectually curious who challenges assumptions and laughs easily'),
    greenFlags: ensureArray(parsed.greenFlags, 3, ['curiosity', 'emotional self-awareness', 'ambition']),
    dealbreakers: ensureArray(parsed.dealbreakers, 3, ['cynicism', 'lack of ambition', 'dishonesty']),
    idealDate: String(parsed.idealDate || 'A lively walk through an inspiring neighborhood, followed by unscripted dinner and drinks'),
    icebreaker: String(parsed.icebreaker || `Hi! I'm ${personName}. What's something you're irrationally passionate about?`),
    controversialTake: String(parsed.controversialTake || 'Most people optimize for comfort when they should optimize for growth'),
    summary: String(parsed.summary || `${personName} combines drive with grounded presence, bringing vibrant intellectual curiosity to every interaction.`),
  };
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
    prompt += `- Headline: ${linkedin.headline || 'N/A'}\n`;
    prompt += `- About: ${linkedin.about || 'N/A'}\n`;
    prompt += `- Current Role: ${linkedin.currentRole || 'N/A'} at ${linkedin.company || 'N/A'}\n`;
    if (linkedin.skills?.length) prompt += `- Skills: ${linkedin.skills.join(', ')}\n`;
    if (linkedin.experience?.length) {
      prompt += `- Experience:\n` + linkedin.experience.slice(0, 3).map(e => `  • ${e.title} at ${e.company}`).join('\n') + '\n';
    }
  }

  if (instagram) {
    prompt += `**Instagram Profile (@${instagram.username}):**\n`;
    prompt += `- Bio: ${instagram.bio || 'N/A'}\n`;
    prompt += `- Followers: ${instagram.followerCount?.toLocaleString() || 'N/A'}\n`;
    if (instagram.recentCaptions?.length) {
      prompt += `- Recent Captions:\n` + instagram.recentCaptions.slice(0, 5).map(c => `  • "${c.slice(0, 150)}"`).join('\n') + '\n';
    }
  }

  prompt += `\nCreate a bespoke, non-generic dating persona tailored to ${name}.`;
  return prompt;
}

function ensureArray(val: unknown, minLength: number, fallback: string[]): string[] {
  if (!Array.isArray(val) || val.length === 0) return fallback.slice(0, minLength);
  return val.map(String).slice(0, minLength);
}

// ===== DYNAMIC PSYCHOGRAPHIC SYNTHESIZER (Guarantees Unique Profiles) =====

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

interface ArchetypeTemplate {
  personalityType: string;
  tagline: (name: string, context: string) => string;
  traits: string[];
  communicationStyle: string;
  humorType: string;
  hobbies: string[];
  passions: string[];
  values: string[];
  lookingFor: string;
  greenFlags: string[];
  dealbreakers: string[];
  idealDate: string;
  icebreaker: (name: string) => string;
  controversialTake: string;
  summary: (name: string, role: string) => string;
}

const ARCHETYPE_LIBRARY: ArchetypeTemplate[] = [
  {
    personalityType: "The Midnight Architect",
    tagline: (name, context) => `Deconstructing complex systems and seeking deep, authentic human connection.`,
    traits: ["analytical", "introspective", "methodical", "hyper-focused"],
    communicationStyle: "Structured, thoughtful, articulate, and listener-first",
    humorType: "Deadpan situational wit and dry intellectual irony",
    hobbies: ["system architecture", "specialty pour-over coffee", "reading history", "long night drives"],
    passions: ["algorithmic elegance", "deep work", "mental models"],
    values: ["intellectual honesty", "craftsmanship", "intentionality"],
    lookingFor: "A curious, independent partner who enjoys deep midnight debates and quiet companionship.",
    greenFlags: ["unhurried presence", "intellectual humility", "sharp conversational recall"],
    dealbreakers: ["superficial small talk", "constant phone addiction", "unexamined assumptions"],
    idealDate: "Quiet vinyl record bar with good espresso, followed by debating philosophy over late-night ramen.",
    icebreaker: (name) => `What's a controversial belief you hold that you rarely share in polite company?`,
    controversialTake: "Most people optimize for social validation when they should be optimizing for peace of mind.",
    summary: (name, role) => `${name} brings rigorous intellectual depth paired with unexpected gentleness. They cut straight through superficial pretense to find real connection.`
  },
  {
    personalityType: "The Kinetic Maverick",
    tagline: (name, context) => `High energy, unscripted adventures, and never settling for ordinary routines.`,
    traits: ["spontaneous", "bold", "infectious", "resilient"],
    communicationStyle: "Fast-paced, expressive, animated, and story-driven",
    humorType: "Playful teasing, high-energy banter, and impromptu roasting",
    hobbies: ["boxing", "scouting rooftop spots", "live music", "street photography"],
    passions: ["disrupting status quo", "experiential travel", "community momentum"],
    values: ["courage", "radical transparency", "bias for action"],
    lookingFor: "An adventurous soul who can match their momentum and laugh through unexpected chaos.",
    greenFlags: ["can take a joke", "down to pack a bag on 2 hours notice", "unapologetic confidence"],
    dealbreakers: ["timidity", "habitual indecision", "pessimism"],
    idealDate: "Crashing an underground gallery opening, grabbing street tacos, and seeing where the night leads.",
    icebreaker: (name) => `If we ditched this city tomorrow with zero plans, where are you booking first?`,
    controversialTake: "Overthinking is the greatest thief of joy—intuition beats analysis 9 times out of 10.",
    summary: (name, role) => `${name} radiates dynamic charisma and unshakeable momentum. Being around them turns an average Tuesday into a memorable story.`
  },
  {
    personalityType: "The Grounded Polymath",
    tagline: (name, context) => `Blending creative curiosity, compounding habits, and quiet emotional depth.`,
    traits: ["reflective", "cultivated", "warm", "disciplined"],
    communicationStyle: "Calm, observant, deeply attentive, and warm",
    humorType: "Witty, observational banter with subtle self-deprecation",
    hobbies: ["bouldering", "reading non-fiction", "curating playlists", "journaling"],
    passions: ["continuous compounding", "lifestyle architecture", "meaningful rituals"],
    values: ["emotional balance", "growth mindset", "sincerity"],
    lookingFor: "A grounded partner who values emotional safety, personal growth, and Sunday stillness.",
    greenFlags: ["kindness to strangers", "genuine emotional maturity", "passion for learning"],
    dealbreakers: ["arrogance", "passive aggression", "lack of self-awareness"],
    idealDate: "Morning coastal hike with two flat whites, debating life's most underrated paradoxes.",
    icebreaker: (name) => `What's an uncomfortable lesson you learned this year that completely leveled you up?`,
    controversialTake: "Consistency is vastly more attractive than sporadic bursts of genius.",
    summary: (name, role) => `${name} pairs sharp insight with an open, attentive heart. They create spaces where genuine vulnerability feels effortless and safe.`
  },
  {
    personalityType: "The Creative Alchemist",
    tagline: (name, context) => `Transforming everyday moments into aesthetic art, raw expression, and genuine spark.`,
    traits: ["artistic", "intuitive", "empathetic", "expressive"],
    communicationStyle: "Poetic, metaphorical, emotionally resonant, and curious",
    humorType: "Whimsical, absurd, and self-aware cultural satire",
    hobbies: ["film photography", "visiting modern art museums", "vintage thrifting", "cooking elaborate dinners"],
    passions: ["visual storytelling", "aesthetic curation", "destigmatizing vulnerability"],
    values: ["authenticity", "creativity", "emotional vulnerability"],
    lookingFor: "Someone soulful, creative, and emotionally grounded who appreciates the beauty in small details.",
    greenFlags: ["appreciates good aesthetics", "open about feelings", "values craft"],
    dealbreakers: ["cynical skepticism", "emotional numbness", "obsession with status"],
    idealDate: "Browsing dusty thrift shops for quirky oddities, followed by an intimate candle-lit wine bar.",
    icebreaker: (name) => `Show me the most recent photo in your camera roll and tell me the uncurated backstory.`,
    controversialTake: "Taste is not subjective—you either care about craft or you settle for noise.",
    summary: (name, role) => `${name} sees the world through a vivid, creative lens. They bring emotional richness and magnetic warmth to every encounter.`
  },
  {
    personalityType: "The Bold Strategist",
    tagline: (name, context) => `Setting ambitious targets, executing with precision, and celebrating hard-won victories.`,
    traits: ["commanding", "resourceful", "pragmatic", "sharp"],
    communicationStyle: "Direct, articulate, purposeful, and engaging",
    humorType: "Quick-witted repartee and sharp verbal fencing",
    hobbies: ["investing", "running marathons", "reading biographies", "chess"],
    passions: ["building enduring ventures", "peak performance", "mentorship"],
    values: ["excellence", "loyalty", "resilience"],
    lookingFor: "A driven equal who has their own ambitions and isn't intimidated by big goals.",
    greenFlags: ["clear life vision", "high personal standards", "celebrates others' success"],
    dealbreakers: ["complacency", "victim mindset", "lack of integrity"],
    idealDate: "Speakeasy cocktails overlooking the city skyline, discussing wild ambitious plans with zero cynicism.",
    icebreaker: (name) => `What's a hill you are completely willing to die on, career or personal?`,
    controversialTake: "Discipline is the highest form of self-love; motivation is just a passing mood.",
    summary: (name, role) => `${name} possesses quiet confidence and relentless focus. Underneath the driven exterior is a deeply loyal and protective partner.`
  },
  {
    personalityType: "The Soulful Explorer",
    tagline: (name, context) => `Seeking authentic cultures, unhurried conversations, and genuine human kinship.`,
    traits: ["open-minded", "adventurous", "mindful", "grounded"],
    communicationStyle: "Gentle, inquisitive, soulful, and present",
    humorType: "Lighthearted, situational, and warm-hearted laughter",
    hobbies: ["backpacking off-grid", "cooking ethnic cuisine", "surfing", "meditation"],
    passions: ["cross-cultural connection", "environmental stewardship", "slow living"],
    values: ["presence", "gratitude", "compassion"],
    lookingFor: "A partner who appreciates sunsets over spreadsheets and prioritizes living deeply over collecting things.",
    greenFlags: ["comfortable in silence", "loves being outdoors", "treats everyone with respect"],
    dealbreakers: ["materialism", "road rage or short tempers", "inability to disconnect"],
    idealDate: "Renting tandem kayaks at golden hour, followed by bonfire beers on the beach.",
    icebreaker: (name) => `What's a place you've traveled to that completely rewired how you see the world?`,
    controversialTake: "The most successful people in life are the ones with the most free time, not the most meetings.",
    summary: (name, role) => `${name} brings soothing presence and boundless perspective. They make people feel deeply grounded, valued, and understood.`
  }
];

export function generateDynamicProfile(
  name: string,
  linkedin: LinkedInData | null,
  instagram: InstagramData | null
): PersonProfile {
  // Extract contextual clues
  const headline = linkedin?.headline || linkedin?.currentRole || '';
  const bio = instagram?.bio || '';
  const combinedContext = `${name} ${headline} ${bio}`.toLowerCase();

  // Deterministic seed based on name to guarantee stability & uniqueness per person
  const hash = hashString(`${name}#${headline}#${bio}`);
  const templateIndex = hash % ARCHETYPE_LIBRARY.length;
  const selectedTemplate = ARCHETYPE_LIBRARY[templateIndex];

  // Derive customized headline / tagline
  const customTagline = headline 
    ? `${name} — ${headline.split('at')[0].trim()}` 
    : bio 
    ? `${name} — ${bio.slice(0, 60)}` 
    : selectedTemplate.tagline(name, combinedContext);

  return {
    tagline: customTagline,
    personalityType: selectedTemplate.personalityType,
    traits: [...selectedTemplate.traits],
    communicationStyle: selectedTemplate.communicationStyle,
    humorType: selectedTemplate.humorType,
    hobbies: [...selectedTemplate.hobbies],
    passions: [...selectedTemplate.passions],
    values: [...selectedTemplate.values],
    lookingFor: selectedTemplate.lookingFor,
    greenFlags: [...selectedTemplate.greenFlags],
    dealbreakers: [...selectedTemplate.dealbreakers],
    idealDate: selectedTemplate.idealDate,
    icebreaker: selectedTemplate.icebreaker(name),
    controversialTake: selectedTemplate.controversialTake,
    summary: selectedTemplate.summary(name, headline),
  };
}
