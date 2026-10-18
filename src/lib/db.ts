import fs from 'fs';
import path from 'path';
import { SEED_PEOPLE as seedPeople } from './seed-people-data';
import { DATE_SCENARIOS } from './types';

// Storage file path (persists newly ingested people & simulations)
function getStoreFilePath(): string {
  if (process.platform !== 'win32' && process.env.NODE_ENV === 'production') {
    return path.join('/tmp', 'agentmatch-store.json');
  }
  return path.join(process.cwd(), 'data', 'store.json');
}

export interface PersonRecord {
  id: string;
  name: string;
  linkedin_url: string;
  instagram_url: string;
  photo_url?: string | null;
  category?: string | null;
  linkedin_data?: string | null;
  instagram_data?: string | null;
  created_at: string;
}

export interface ProfileRecord {
  id: string;
  person_id: string;
  tagline: string;
  personality_type: string;
  traits: string[];
  communication_style: string;
  humor_type: string;
  hobbies: string[];
  passions: string[];
  values_list: string[];
  looking_for: string;
  green_flags: string[];
  dealbreakers: string[];
  ideal_date: string;
  icebreaker: string;
  controversial_take: string;
  summary: string;
  created_at: string;
}

export interface DateRecord {
  id: string;
  person1_id: string;
  person2_id: string;
  person1_name: string;
  person2_name: string;
  person1_photo?: string | null;
  person2_photo?: string | null;
  round: number;
  scenario: string;
  messages: Array<{ sender: string; senderName: string; content: string }>;
  chemistry_score: number;
  highlights?: string | null;
  created_at: string;
}

export interface RankingRecord {
  id: string;
  person_id: string;
  ranked_person_id: string;
  ranked_person_name: string;
  ranked_person_photo?: string | null;
  ranked_person_personality?: string | null;
  ranked_person_tagline?: string | null;
  rank: number;
  overall_score: number;
  headline: string;
  summary: string;
  sharedInterests: string[];
  complementaryTraits: string[];
  potentialFriction: string[];
  best_date_idea: string;
  created_at: string;
}

interface DataStore {
  people: PersonRecord[];
  profiles: ProfileRecord[];
  dates: DateRecord[];
  rankings: RankingRecord[];
}

const DETAILED_PROFILES: Record<string, Partial<ProfileRecord>> = {
  "Gary Vaynerchuk": {
    personality_type: "The Relentless Hustler",
    tagline: "High-octane energy, passionate about attention, macro patience & micro speed.",
    traits: ["hyper-energetic", "unfiltered", "empathetic", "tenacious"],
    communication_style: "Raw, direct, candid with high kinetic energy",
    humor_type: "Loud, punchy, self-deprecating street smarts",
    hobbies: ["garage saling", "watching New York Jets", "collecting sports cards", "wine tasting"],
    passions: ["entrepreneurship", "consumer behavior", "mentoring creators"],
    values_list: ["gratitude", "accountability", "kindness", "hustle"],
    looking_for: "Someone grounded who can handle the chaos of 100 projects and calls them out on their BS.",
    green_flags: ["emotional resilience", "authentic optimism", "family values"],
    dealbreakers: ["cynicism", "complaining without action", "arrogance"],
    ideal_date: "Hitting an early morning flea market in Queens, bargaining for vintage collectibles, followed by dirty street tacos.",
    icebreaker: "Be honest: if you had 24 hours and zero meetings, are you sleeping in or flipping items on eBay?",
    controversial_take: "Work-life balance is a myth if you love what you do 14 hours a day.",
    summary: "Gary brings 200 mph enthusiasm into every interaction. Beneath the loud media mogul persona is someone surprisingly empathetic who values deep emotional connection."
  },
  "Sahil Bloom": {
    personality_type: "The Thoughtful Polymath",
    tagline: "Building a life around curiosity, compounding habits, and deep human bonds.",
    traits: ["reflective", "methodical", "warm", "disciplined"],
    communication_style: "Articulate, structured, thoughtful, and listener-first",
    humor_type: "Subtle, situational, witty intellectual banter",
    hobbies: ["weightlifting", "writing cold brew essays", "reading biographies", "golfing"],
    passions: ["mental models", "personal growth", "parenting philosophy"],
    values_list: ["intentionality", "compound growth", "intellectual humility"],
    looking_for: "A partner who loves deep Sunday walk discussions about ideas, life choices, and quiet ambitions.",
    green_flags: ["love of reading", "curiosity about how things work", "unhurried presence"],
    dealbreakers: ["superficiality", "constant distraction by notifications", "victim mindset"],
    ideal_date: "Morning coastal hike with two flat whites, debating history's most underrated paradoxes.",
    icebreaker: "What's an uncomfortable truth you realized in the last six months that completely changed your trajectory?",
    controversial_take: "Most people optimize for optionality when they should be optimizing for commitment.",
    summary: "Sahil combines analytical clarity with an open heart. He creates space where vulnerable, ambitious conversations flourish naturally."
  },
  "Ali Abdaal": {
    personality_type: "The Cheerful Optimizer",
    tagline: "Ex-doctor turned creator, turning productivity into feel-good play.",
    traits: ["curious", "playful", "optimistic", "analytical"],
    communication_style: "Warm, enthusiastic, conversational, and question-driven",
    humor_type: "Gentle self-deprecation, lighthearted nerdiness",
    hobbies: ["speed reading", "playing piano", "journaling with fountain pens", "bouldering"],
    passions: ["evidence-based productivity", "lifestyle design", "teaching"],
    values_list: ["curiosity", "joyful effort", "kindness", "growth"],
    looking_for: "Someone smart, playful, and kind who doesn't take life too seriously and loves learning new crafts together.",
    green_flags: ["gets excited about obscure topics", "kind to service staff", "loves board games"],
    dealbreakers: ["habitual negativity", "unwillingness to communicate openly", "lack of curiosity"],
    ideal_date: "Cozy bookshop browsing where each buys the other a mystery paperback, followed by matcha lattes and playing chess.",
    icebreaker: "What's something you genuinely love doing that most adults think is a waste of time?",
    controversial_take: "Discipline is overrated — if something feels like a drag, you've designed the system wrong.",
    summary: "Ali brings gentle warmth and contagious enthusiasm. He listens with real presence and turns ordinary dates into fun, exploratory games."
  },
  "Sara Blakely": {
    personality_type: "The Fearless Innovator",
    tagline: "Spanx founder who turned failure into a superpower and laughs through the hustle.",
    traits: ["gutsy", "hilarious", "resilient", "grounded"],
    communication_style: "Storytelling-rich, self-deprecating, utterly authentic",
    humor_type: "Goofy, physical comedy, laughing at her own awkward moments",
    hobbies: ["belly dancing in the kitchen", "visualizing crazy dreams", "pranks", "decorating shoes"],
    passions: ["empowering women", "creative entrepreneurship", "destigmatizing failure"],
    values_list: ["courage", "humor", "kindness", "grit"],
    looking_for: "A partner who cheers loudly at wins, laughs when things go wrong, and has zero ego.",
    green_flags: ["can laugh at themselves", "celebrates others' success", "loves a wild brainstorm"],
    dealbreakers: ["fragile egos", "taking oneself too seriously", "pessimism"],
    ideal_date: "Grabbing milkshakes, sitting in a diner booth, and telling each other the most embarrassing failures that ended up being blessings.",
    icebreaker: "Tell me your most cringe-worthy public failure right now — I'll match it with three of mine.",
    controversial_take: "A lack of formal training in an industry is your single biggest competitive advantage.",
    summary: "Sara is a masterclass in joy, grit, and humility. She radiates vibrant energy and instantly puts people at ease."
  },
  "Tim Ferriss": {
    personality_type: "The Meticulous Experimenter",
    tagline: "Deconstructing mastery, asking unusual questions, seeking quiet stillness.",
    traits: ["analytical", "introspective", "generous", "deliberate"],
    communication_style: "Pensive, deliberate, asks second-order questions",
    humor_type: "Dry, witty, philosophical ironies",
    hobbies: ["Japanese tea ceremony", "archery", "sommelier training", "dog training"],
    passions: ["mental health research", "accelerated learning", "stoic philosophy"],
    values_list: ["clarity", "freedom", "loyalty", "depth"],
    looking_for: "An emotionally grounded companion who treasures quiet spaces, wilderness escapes, and unhurried dialogue.",
    green_flags: ["comfortable with companionable silence", "nature lover", "thoughtful boundaries"],
    dealbreakers: ["drama addiction", "loud chaos", "flakiness"],
    ideal_date: "Stargazing by a campfire in Big Sur with hot puerh tea, discussing which books re-calibrated our worldview.",
    icebreaker: "If you could whisper one sentence into the ear of your 20-year-old self, what would you say?",
    controversial_take: "Saying 'yes' to almost everything is how you ruin your life in your 30s.",
    summary: "Tim is thoughtful, generous, and quiet. Once past the initial stoic reserve, he brings intense loyalty and deep, unhurried presence."
  },
  "Chris Do": {
    personality_type: "The Aesthetic Sensei",
    tagline: "Design thinking applied to human pricing, identity, and life mastery.",
    traits: ["sharp", "minimalist", "calm", "provocative"],
    communication_style: "Measured, Socratic, deadpan questions, deeply insightful",
    humor_type: "Ultra-dry, sarcastic, deadpan intellectual punchlines",
    hobbies: ["typography hunting", "collecting avant-garde sneakers", "minimalist architecture", "black coffee"],
    passions: ["teaching creative business", "graphic design", "negotiation mastery"],
    values_list: ["mastery", "clarity", "design purity", "self-respect"],
    looking_for: "A sharp, design-minded soul who appreciates spatial beauty and doesn't get rattled by direct questions.",
    green_flags: ["impeccable taste", "loves critical thinking", "unafraid of candid feedback"],
    dealbreakers: ["clutter", "passive aggressiveness", "poor typography"],
    ideal_date: "Touring an empty brutalist art pavilion, analyzing kerning on museum plaques, followed by espresso at an omakase counter.",
    icebreaker: "If I charge you $10,000 for this conversation, what question would you ask me right now?",
    controversial_take: "Good design is invisible, and most people are terrified of simplicity because it exposes their lack of substance.",
    summary: "Chris brings zen-like focus and laser clarity. He sees through pretenses in seconds and honors pure craft and deep sincerity."
  },
  "Saikat Das": {
    personality_type: "The Thoughtful Enigma",
    tagline: "Curious mind, quiet depth, and crafting elegant human solutions.",
    traits: ["analytical", "insightful", "grounded", "curious"],
    communication_style: "Articulate, calm, thoughtful, and listener-first",
    humor_type: "Observational irony and dry intellectual wit",
    hobbies: ["exploring obscure architecture", "reading sci-fi", "specialty coffee brewing", "chess"],
    passions: ["engineering craftsmanship", "human psychology", "creative problem-solving"],
    values_list: ["intellectual honesty", "integrity", "depth over noise"],
    looking_for: "Someone emotionally intelligent and curious who loves Sunday walks, deep debates, and unhurried stillness.",
    green_flags: ["emotional maturity", "love of deep reading", "unpretentious presence"],
    dealbreakers: ["superficial small talk", "arrogance", "dishonesty"],
    ideal_date: "Browsing an indie bookstore, picking a mystery book for each other, then debating ideas over espresso.",
    icebreaker: "What's an idea or subject you could happily talk about for four hours straight without getting bored?",
    controversial_take: "Most people talk to be heard rather than to understand—silence is the most underrated communication skill.",
    summary: "Saikat combines intellectual precision with authentic warmth. He creates space where deep, meaningful conversations happen effortlessly."
  },
  "Anirudh Singh": {
    personality_type: "The Kinetic Maverick",
    tagline: "High-energy builder turning bold ideas into unstoppable momentum.",
    traits: ["fearless", "strategic", "dynamic", "charismatic"],
    communication_style: "Rapid-fire, animated, storytelling-rich, and direct",
    humor_type: "Playful teasing, quick-witted sarcastic banter",
    hobbies: ["calisthenics", "scouting rooftop cafes", "analyzing tech trends", "road tripping"],
    passions: ["exponential tech", "disrupting conventional wisdom", "building communities"],
    values_list: ["boldness", "radical candor", "loyalty"],
    looking_for: "Someone ambitious, playful, and sharp who doesn't take life too seriously and loves sudden adventures.",
    green_flags: ["unfiltered authenticity", "can match sharp banter", "bias for action"],
    dealbreakers: ["timidity", "habitual complaining", "indecision"],
    ideal_date: "Cocktails at an underground speakeasy followed by spontaneous street food and debating life goals till 2 AM.",
    icebreaker: "Let's skip the small talk: what's the craziest calculated risk you've ever taken, and did it pay off?",
    controversial_take: "Comfort is a silent career killer—if you're not uncomfortable, you're not growing.",
    summary: "Anirudh brings magnetic charisma and infectious energy into every room. He challenges you to think bigger while laughing through the chaos."
  },
  "Nikshay Goyal": {
    personality_type: "The Strategic Architect",
    tagline: "Solving hard problems with deep curiosity, high standards, and calm clarity.",
    traits: ["analytical", "resourceful", "ambitious", "articulate"],
    communication_style: "Insightful, grounded, and engaging",
    humor_type: "Dry wit, sharp observational banter",
    hobbies: ["exploring AI architectures", "reading non-fiction", "fitness", "late-night coding"],
    passions: ["cutting-edge technology", "building high-impact systems", "continuous compounding"],
    values_list: ["intellectual honesty", "integrity", "bold ambition"],
    looking_for: "A bright, curious, and grounded partner who loves deep discussions and big dreams.",
    green_flags: ["intellectual curiosity", "emotional maturity", "authenticity"],
    dealbreakers: ["lack of ambition", "superficiality", "constant negativity"],
    ideal_date: "An evening walk through an inspiring neighborhood, lively discussions over great food, and zero distractions.",
    icebreaker: "What's an idea or project you're working on that you can talk about for hours?",
    controversial_take: "True innovation comes from questioning the assumptions everyone else takes for granted.",
    summary: "Nikshay combines intellectual rigor with a grounded, curious mindset. He brings thoughtful depth and infectious drive to every conversation."
  }
};

function initializeDataStore(): DataStore {
  // If store file exists, read it
  const filePath = getStoreFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.people) && parsed.people.length > 0) {
        let modified = false;
        for (const sp of seedPeople) {
          const exists = parsed.people.some((p: PersonRecord) => p.name.toLowerCase() === sp.name.toLowerCase());
          if (!exists) {
            const isSaikat = sp.name.toLowerCase().includes('saikat');
            const isAnirudh = sp.name.toLowerCase().includes('anirudh');
            const id = isSaikat 
              ? '38a33785-2758-4dc5-80db-608eaaca9424' 
              : isAnirudh 
              ? '8f651dd0-68b3-42bb-a62f-263f39b6570c' 
              : `person-${parsed.people.length + 1}`;
            const custom = DETAILED_PROFILES[sp.name as keyof typeof DETAILED_PROFILES];

            parsed.people.unshift({
              id,
              name: sp.name,
              linkedin_url: sp.linkedinUrl,
              instagram_url: sp.instagramUrl,
              photo_url: null,
              category: sp.category,
              linkedin_data: JSON.stringify({ headline: `${sp.category} leader & creator` }),
              instagram_data: JSON.stringify({ bio: custom?.tagline || '' }),
              created_at: new Date().toISOString(),
            });

            parsed.profiles.unshift({
              id: `profile-${id}`,
              person_id: id,
              tagline: custom?.tagline || '',
              personality_type: custom?.personality_type || 'The Visionary',
              traits: custom?.traits || ['curious', 'driven'],
              communication_style: custom?.communication_style || 'Engaging',
              humor_type: custom?.humor_type || 'Witty',
              hobbies: custom?.hobbies || [],
              passions: custom?.passions || [],
              values_list: custom?.values_list || [],
              looking_for: custom?.looking_for || '',
              green_flags: custom?.green_flags || [],
              dealbreakers: custom?.dealbreakers || [],
              ideal_date: custom?.ideal_date || '',
              icebreaker: custom?.icebreaker || '',
              controversial_take: custom?.controversial_take || '',
              summary: custom?.summary || '',
              created_at: new Date().toISOString(),
            });

            modified = true;
          }
        }

        // Overwrite any profiles that match DETAILED_PROFILES to ensure they never share generic fallbacks
        for (const [dName, custom] of Object.entries(DETAILED_PROFILES)) {
          const person = parsed.people.find((p: PersonRecord) => p.name.toLowerCase() === dName.toLowerCase());
          if (person) {
            const profIdx = parsed.profiles.findIndex((pr: ProfileRecord) => pr.person_id === person.id);
            const c = custom as Record<string, unknown>;
            const freshProfile: ProfileRecord = {
              id: profIdx >= 0 ? parsed.profiles[profIdx].id : `profile-${person.id}`,
              person_id: person.id,
              tagline: String(c.tagline || ''),
              personality_type: String(c.personality_type || 'The Visionary'),
              traits: Array.isArray(c.traits) ? (c.traits as string[]) : ['curious', 'driven'],
              communication_style: String(c.communication_style || 'Engaging'),
              humor_type: String(c.humor_type || 'Witty'),
              hobbies: Array.isArray(c.hobbies) ? (c.hobbies as string[]) : [],
              passions: Array.isArray(c.passions) ? (c.passions as string[]) : [],
              values_list: Array.isArray(c.values_list) ? (c.values_list as string[]) : [],
              looking_for: String(c.looking_for || ''),
              green_flags: Array.isArray(c.green_flags) ? (c.green_flags as string[]) : [],
              dealbreakers: Array.isArray(c.dealbreakers) ? (c.dealbreakers as string[]) : [],
              ideal_date: String(c.ideal_date || ''),
              icebreaker: String(c.icebreaker || ''),
              controversial_take: String(c.controversial_take || ''),
              summary: String(c.summary || ''),
              created_at: new Date().toISOString()
            };

            if (profIdx >= 0) {
              parsed.profiles[profIdx] = freshProfile;
            } else {
              parsed.profiles.unshift(freshProfile);
            }
            modified = true;
          }
        }

        if (modified) {
          try {
            fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), 'utf-8');
          } catch {}
        }

        return parsed;
      }
    }
  } catch (err) {
    console.warn('[Store] Could not read existing store file:', err);
  }

  // Otherwise, construct complete seed dataset
  const people: PersonRecord[] = [];
  const profiles: ProfileRecord[] = [];
  const dates: DateRecord[] = [];
  const rankings: RankingRecord[] = [];

  seedPeople.forEach((person, idx) => {
    const id = `person-${idx + 1}`;
    const custom = DETAILED_PROFILES[person.name as keyof typeof DETAILED_PROFILES];

    const personalityType = custom?.personality_type || `The Dynamic ${person.category.charAt(0).toUpperCase() + person.category.slice(1)}`;
    const tagline = custom?.tagline || `Living at the intersection of passion, purpose, and ${person.category}.`;
    const traits = custom?.traits || ["passionate", "visionary", "creative", "driven"];
    const communicationStyle = custom?.communication_style || "Engaging, authentic, and charismatic";
    const humorType = custom?.humor_type || "Playful and quick-witted";
    const hobbies = custom?.hobbies || ["traveling", "exploring new cuisine", "fitness", "reading"];
    const passions = custom?.passions || ["human potential", "storytelling", "community building"];
    const values = custom?.values_list || ["authenticity", "growth", "kindness"];
    const lookingFor = custom?.looking_for || "A partner who shares big ambitions, loves laughing, and values genuine connection.";
    const greenFlags = custom?.green_flags || ["emotional maturity", "sense of humor", "intellectual curiosity"];
    const dealbreakers = custom?.dealbreakers || ["arrogance", "lack of drive", "dishonesty"];
    const idealDate = custom?.ideal_date || "Exploring a lively neighborhood market followed by great food and hours of unscripted conversation.";
    const icebreaker = custom?.icebreaker || "Hey! What's something you're working on that lights you up right now?";
    const controversialTake = custom?.controversial_take || "The best things in life happen when you throw away the script.";
    const summary = custom?.summary || `${person.name} is a renowned figure known for bringing energy, insight, and genuine passion to everything they create.`;

    const personRec: PersonRecord = {
      id,
      name: person.name,
      linkedin_url: person.linkedinUrl,
      instagram_url: person.instagramUrl,
      photo_url: null,
      category: person.category,
      linkedin_data: JSON.stringify({ headline: `${person.category} leader & creator` }),
      instagram_data: JSON.stringify({ bio: tagline }),
      created_at: new Date(Date.now() - (idx * 3600000)).toISOString()
    };

    const profileRec: ProfileRecord = {
      id: `profile-${idx + 1}`,
      person_id: id,
      tagline,
      personality_type: personalityType,
      traits,
      communication_style: communicationStyle,
      humor_type: humorType,
      hobbies,
      passions,
      values_list: values,
      looking_for: lookingFor,
      green_flags: greenFlags,
      dealbreakers: dealbreakers,
      ideal_date: idealDate,
      icebreaker,
      controversial_take: controversialTake,
      summary,
      created_at: new Date(Date.now() - (idx * 3600000)).toISOString()
    };

    people.push(personRec);
    profiles.push(profileRec);
  });

  // Seed sample dates
  const samplePairs: [number, number, number, string, number][] = [
    [0, 3, 1, "Sara had Gary howling with laughter about her early Spanx pitch fails in Neiman Marcus bathrooms.", 94],
    [1, 4, 0, "Tim and Sahil bonded deeply over tea rituals, journaling paradoxes, and the discipline of saying no.", 92],
    [2, 6, 4, "Ali made Casey laugh out loud debating whether an iPad app could replace a skate camera lens.", 88],
    [5, 7, 2, "Marie and Jay Shetty traded spiritual war stories until 2 AM with effortless infectious warmth.", 96],
    [8, 10, 6, "Simon and Brene engaged in a masterclass of emotional depth, validating each other's vulnerabilities.", 95],
    [9, 11, 3, "Casey and Chris Do analyzed graffiti aesthetics while bantering about hustle vs minimalist restraint.", 86],
    [0, 1, 0, "Gary tested Sahil's thesis on slow compounding while Sahil challenged Gary on sleeping 4 hours.", 89],
    [2, 5, 5, "Ali and Marie turned a chaotic pasta disaster into an impromptu motivational comedy routine.", 91],
    [3, 8, 1, "Sara and Simon debated why modern corporate America needs more vulnerability and Spanx-level boldness.", 90],
    [4, 7, 7, "Tim and Jay watched the mountain mist while sharing meditation realizations that spanned decades.", 93],
    [6, 9, 4, "Casey dragged Chris Do onto a delayed airport electric cart to film an impromptu cinematic sprint.", 84],
    [10, 1, 0, "Brene and Sahil broke down the emotional courage required to build quiet generational habits.", 91],
  ];

  samplePairs.forEach(([idx1, idx2, scenIdx, highlight, chem], dIdx) => {
    if (idx1 < people.length && idx2 < people.length) {
      const p1 = people[idx1];
      const p2 = people[idx2];
      const scenario = DATE_SCENARIOS[scenIdx % DATE_SCENARIOS.length];

      dates.push({
        id: `date-${dIdx + 1}`,
        person1_id: p1.id,
        person2_id: p2.id,
        person1_name: p1.name,
        person2_name: p2.name,
        person1_photo: p1.photo_url,
        person2_photo: p2.photo_url,
        round: 2,
        scenario: JSON.stringify(scenario),
        messages: [
          { sender: p1.id, senderName: p1.name, content: `Hey ${p2.name}! Glad we finally made this happen. ${scenario.prompt.split('.')[0]}.` },
          { sender: p2.id, senderName: p2.name, content: `Honestly, couldn't ask for a better backdrop. Let's skip the small talk though — tell me something you're obsessed with right now.` },
          { sender: p1.id, senderName: p1.name, content: `I love that energy! Right now it's about stripping away unnecessary friction and finding what genuinely energizes people.` },
          { sender: p2.id, senderName: p2.name, content: `That hits home. Most people spend decades overcomplicating things when real clarity is right in front of them.` },
          { sender: p1.id, senderName: p1.name, content: `Exactly. If we're not having fun and building something authentic together, what are we even doing here?` }
        ],
        chemistry_score: chem,
        highlights: highlight,
        created_at: new Date(Date.now() - (dIdx * 7200000)).toISOString()
      });
    }
  });

  // Seed sample rankings
  const headlines = [
    "The Power Couple", "Kinetic Chemistry", "Soulful Synchronicity",
    "Opposites Attract", "Mutual Inspiration", "Creative Spark",
    "Slow Burn Potential", "Grounded Balance", "Unstoppable Duo", "Playful Spark"
  ];

  people.forEach((current, i) => {
    const others = people.filter(p => p.id !== current.id);
    const ranked = others.map((other, rankIndex) => ({
      ...other,
      score: Math.max(65, Math.min(98, 96 - ((i * 7 + rankIndex * 13) % 30)))
    })).sort((a, b) => b.score - a.score);

    ranked.slice(0, 10).forEach((match, rank) => {
      const matchProfile = profiles.find(pr => pr.person_id === match.id);
      rankings.push({
        id: `rank-${current.id}-${match.id}`,
        person_id: current.id,
        ranked_person_id: match.id,
        ranked_person_name: match.name,
        ranked_person_photo: match.photo_url,
        ranked_person_personality: matchProfile?.personality_type,
        ranked_person_tagline: matchProfile?.tagline,
        rank: rank + 1,
        overall_score: match.score,
        headline: headlines[rank % headlines.length],
        summary: `Both ${current.name} and ${match.name} share an unrelenting commitment to authenticity, creative impact, and laughing through life's unexpected twists.`,
        sharedInterests: ["High-impact storytelling", "Continuous personal growth", "Deep unfiltered conversations"],
        complementaryTraits: ["One brings bold momentum, the other brings strategic depth", "Mutual emotional safety and security"],
        potentialFriction: ["Both lead busy global schedules requiring intentional quality time", "Stubbornness about creative direction"],
        best_date_idea: "A spontaneous evening exploring an art studio or quiet retreat, ending with great tea and no cell phones.",
        created_at: new Date(Date.now() - (rank * 3600000)).toISOString()
      });
    });
  });

  const store: DataStore = { people, profiles, dates, rankings };

  // Persist store to file if directory is writable
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Store] Could not write store to disk:', err);
  }

  return store;
}

// Global in-memory singleton
const globalForStore = globalThis as unknown as {
  agentMatchStore: DataStore | undefined;
};

function getStore(): DataStore {
  if (!globalForStore.agentMatchStore) {
    globalForStore.agentMatchStore = initializeDataStore();
  }
  return globalForStore.agentMatchStore;
}

function persistStore() {
  const store = getStore();
  const filePath = getStoreFilePath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Store] Could not persist store:', err);
  }
}

// ===== Public API Functions Matching Exact Signatures =====

export function generateId(): string {
  return crypto.randomUUID();
}

export function createPerson(data: {
  name: string;
  linkedinUrl: string;
  instagramUrl: string;
  photoUrl?: string;
  category?: string;
  linkedinData?: string;
  instagramData?: string;
}) {
  const store = getStore();
  const id = generateId();
  const person: PersonRecord = {
    id,
    name: data.name,
    linkedin_url: data.linkedinUrl,
    instagram_url: data.instagramUrl,
    photo_url: data.photoUrl || null,
    category: data.category || null,
    linkedin_data: data.linkedinData || null,
    instagram_data: data.instagramData || null,
    created_at: new Date().toISOString(),
  };

  store.people.unshift(person);
  persistStore();
  return id;
}

export function getAllPeople() {
  const store = getStore();
  return store.people;
}

export function getPersonById(id: string) {
  const store = getStore();
  const direct = store.people.find(p => p.id === id);
  if (direct) return direct;
  
  // Historical UUID alias resolution (e.g., dynamic session links)
  if (id === '38a33785-2758-4dc5-80db-608eaaca9424' || id.toLowerCase().includes('saikat')) {
    const saikat = store.people.find(p => p.name.toLowerCase().includes('saikat'));
    if (saikat) return saikat;
  }
  if (id === '8f651dd0-68b3-42bb-a62f-263f39b6570c' || id.toLowerCase().includes('anirudh')) {
    const anirudh = store.people.find(p => p.name.toLowerCase().includes('anirudh'));
    if (anirudh) return anirudh;
  }

  // Name slug resolution
  const normalizedId = id.toLowerCase().replace(/[^a-z0-9]/g, '');
  const bySlug = store.people.find(p => p.name.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedId);
  if (bySlug) return bySlug;

  return null;
}

export function updatePersonData(id: string, field: string, value: string) {
  const store = getStore();
  const person = store.people.find(p => p.id === id);
  if (person) {
    (person as unknown as Record<string, string>)[field] = value;
    persistStore();
  }
}

export function createProfile(personId: string, profile: {
  tagline: string;
  personalityType: string;
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
  icebreaker: string;
  controversialTake: string;
  summary: string;
}) {
  const store = getStore();
  const id = generateId();
  const existingIdx = store.profiles.findIndex(pr => pr.person_id === personId);

  const profileRec: ProfileRecord = {
    id,
    person_id: personId,
    tagline: profile.tagline,
    personality_type: profile.personalityType,
    traits: profile.traits,
    communication_style: profile.communicationStyle,
    humor_type: profile.humorType,
    hobbies: profile.hobbies,
    passions: profile.passions,
    values_list: profile.values,
    looking_for: profile.lookingFor,
    green_flags: profile.greenFlags,
    dealbreakers: profile.dealbreakers,
    ideal_date: profile.idealDate,
    icebreaker: profile.icebreaker,
    controversial_take: profile.controversialTake,
    summary: profile.summary,
    created_at: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    store.profiles[existingIdx] = profileRec;
  } else {
    store.profiles.unshift(profileRec);
  }

  persistStore();
  return id;
}

export function getProfileByPersonId(personId: string) {
  const store = getStore();
  let pr = store.profiles.find(p => p.person_id === personId);
  
  if (!pr) {
    const person = getPersonById(personId);
    if (person) {
      pr = store.profiles.find(p => p.person_id === person.id);
    }
  }

  if (!pr) return null;
  return {
    ...pr,
    values: pr.values_list,
    greenFlags: pr.green_flags,
    dealbreakers: pr.dealbreakers,
  };
}

export function getAllProfiles() {
  const store = getStore();
  return store.people.map(p => {
    const pr = store.profiles.find(prof => prof.person_id === p.id);
    return {
      ...p,
      tagline: pr?.tagline || '',
      personality_type: pr?.personality_type || 'The Explorer',
      traits: pr?.traits || ['curious', 'driven'],
      communication_style: pr?.communication_style || 'Engaging',
      humor_type: pr?.humor_type || 'Witty',
      hobbies: pr?.hobbies || [],
      passions: pr?.passions || [],
      values: pr?.values_list || [],
      values_list: pr?.values_list || [],
      looking_for: pr?.looking_for || '',
      green_flags: pr?.green_flags || [],
      greenFlags: pr?.green_flags || [],
      dealbreakers: pr?.dealbreakers || [],
      ideal_date: pr?.ideal_date || '',
      icebreaker: pr?.icebreaker || '',
      controversial_take: pr?.controversial_take || '',
      summary: pr?.summary || '',
    };
  });
}

export function createDateConversation(data: {
  person1Id: string;
  person2Id: string;
  round: number;
  scenario: string;
  messages: Array<{ sender: string; senderName: string; content: string }>;
  chemistryScore: number;
  highlights?: string;
}) {
  const store = getStore();
  const id = generateId();
  const p1 = store.people.find(p => p.id === data.person1Id);
  const p2 = store.people.find(p => p.id === data.person2Id);

  const dateRec: DateRecord = {
    id,
    person1_id: data.person1Id,
    person2_id: data.person2Id,
    person1_name: p1?.name || 'Partner A',
    person2_name: p2?.name || 'Partner B',
    person1_photo: p1?.photo_url,
    person2_photo: p2?.photo_url,
    round: data.round,
    scenario: data.scenario,
    messages: data.messages,
    chemistry_score: data.chemistryScore,
    highlights: data.highlights || null,
    created_at: new Date().toISOString(),
  };

  store.dates.unshift(dateRec);
  persistStore();
  return id;
}

export function getDatesByPersonId(personId: string) {
  const store = getStore();
  return store.dates.filter(d => d.person1_id === personId || d.person2_id === personId);
}

export function getAllDates() {
  const store = getStore();
  return store.dates;
}

export function createRanking(data: {
  personId: string;
  rankedPersonId: string;
  rank: number;
  overallScore: number;
  headline: string;
  summary: string;
  sharedInterests: string[];
  complementaryTraits: string[];
  potentialFriction: string[];
  bestDateIdea: string;
}) {
  const store = getStore();
  const id = generateId();
  const target = store.people.find(p => p.id === data.rankedPersonId);
  const targetProfile = store.profiles.find(pr => pr.person_id === data.rankedPersonId);

  const rankingRec: RankingRecord = {
    id,
    person_id: data.personId,
    ranked_person_id: data.rankedPersonId,
    ranked_person_name: target?.name || 'Match',
    ranked_person_photo: target?.photo_url,
    ranked_person_personality: targetProfile?.personality_type,
    ranked_person_tagline: targetProfile?.tagline,
    rank: data.rank,
    overall_score: data.overallScore,
    headline: data.headline,
    summary: data.summary,
    sharedInterests: data.sharedInterests,
    complementaryTraits: data.complementaryTraits,
    potentialFriction: data.potentialFriction,
    best_date_idea: data.bestDateIdea,
    created_at: new Date().toISOString(),
  };

  const existingIdx = store.rankings.findIndex(r => r.person_id === data.personId && r.ranked_person_id === data.rankedPersonId);
  if (existingIdx >= 0) {
    store.rankings[existingIdx] = rankingRec;
  } else {
    store.rankings.push(rankingRec);
  }

  persistStore();
  return id;
}

export function getRankingsByPersonId(personId: string) {
  const store = getStore();
  return store.rankings
    .filter(r => r.person_id === personId)
    .sort((a, b) => a.rank - b.rank);
}

export function getAllRankings() {
  const store = getStore();
  return store.rankings;
}

export function getStats() {
  const store = getStore();
  return {
    people: store.people.length,
    profiles: store.profiles.length,
    dates: store.dates.length,
    rankings: store.rankings.length,
  };
}

// Backward compatibility stub for scripts
export function getDb() {
  return {
    prepare: (_sql?: string) => ({
      run: (..._args: any[]) => {},
      get: (..._args: any[]) => null,
      all: (..._args: any[]) => [] as any[],
    }),
    exec: (_sql?: string) => {},
    pragma: (_pragma?: string) => {},
  };
}
