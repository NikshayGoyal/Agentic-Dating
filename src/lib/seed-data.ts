import type Database from 'better-sqlite3';
import seedPeople from '../../data/seed-people.json';
import { DATE_SCENARIOS } from './types';

const DETAILED_PROFILES: Record<string, {
  personalityType: string;
  tagline: string;
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
}> = {
  "Gary Vaynerchuk": {
    personalityType: "The Relentless Hustler",
    tagline: "High-octane energy, passionate about attention, macro patience & micro speed.",
    traits: ["hyper-energetic", "unfiltered", "empathetic", "tenacious"],
    communicationStyle: "Raw, direct, candid with high kinetic energy",
    humorType: "Loud, punchy, self-deprecating street smarts",
    hobbies: ["garage saling", "watching New York Jets", "collecting sports cards", "wine tasting"],
    passions: ["entrepreneurship", "consumer behavior", "mentoring creators"],
    values: ["gratitude", "accountability", "kindness", "hustle"],
    lookingFor: "Someone grounded who can handle the chaos of 100 projects and calls them out on their BS.",
    greenFlags: ["emotional resilience", "authentic optimism", "family values"],
    dealbreakers: ["cynicism", "complaining without action", "arrogance"],
    idealDate: "Hitting an early morning flea market in Queens, bargaining for vintage collectibles, followed by dirty street tacos.",
    icebreaker: "Be honest: if you had 24 hours and zero meetings, are you sleeping in or flipping items on eBay?",
    controversialTake: "Work-life balance is a myth if you love what you do 14 hours a day.",
    summary: "Gary brings 200 mph enthusiasm into every interaction. Beneath the loud media mogul persona is someone surprisingly empathetic who values deep emotional connection."
  },
  "Sahil Bloom": {
    personalityType: "The Thoughtful Polymath",
    tagline: "Building a life around curiosity, compounding habits, and deep human bonds.",
    traits: ["reflective", "methodical", "warm", "disciplined"],
    communicationStyle: "Articulate, structured, thoughtful, and listener-first",
    humorType: "Subtle, situational, witty intellectual banter",
    hobbies: ["weightlifting", "writing cold brew essays", "reading biographies", "golfing"],
    passions: ["mental models", "personal growth", "parenting philosophy"],
    values: ["intentionality", "compound growth", "intellectual humility"],
    lookingFor: "A partner who loves deep Sunday walk discussions about ideas, life choices, and quiet ambitions.",
    greenFlags: ["love of reading", "curiosity about how things work", "unhurried presence"],
    dealbreakers: ["superficiality", "constant distraction by notifications", "victim mindset"],
    idealDate: "Morning coastal hike with two flat whites, debating history's most underrated paradoxes.",
    icebreaker: "What's an uncomfortable truth you realized in the last six months that completely changed your trajectory?",
    controversialTake: "Most people optimize for optionality when they should be optimizing for commitment.",
    summary: "Sahil combines analytical clarity with an open heart. He creates space where vulnerable, ambitious conversations flourish naturally."
  },
  "Ali Abdaal": {
    personalityType: "The Cheerful Optimizer",
    tagline: "Ex-doctor turned creator, turning productivity into feel-good play.",
    traits: ["curious", "playful", "optimistic", "analytical"],
    communicationStyle: "Warm, enthusiastic, conversational, and question-driven",
    humorType: "Self-aware geek humor with gentle self-roasting",
    hobbies: ["playing piano", "reading sci-fi", "tinkering with Notion", "singing along to musicals"],
    passions: ["feel-good productivity", "education", "storytelling"],
    values: ["joy in work", "generosity", "lifelong learning"],
    lookingFor: "A partner who can geek out over a new hobby, play board games, and doesn't mind life being run on calendar blocks.",
    greenFlags: ["enthusiasm for niche hobbies", "loves laughing at oneself", "adventurous spirit"],
    dealbreakers: ["joy-killers", "dismissing playfulness", "pessimism"],
    idealDate: "A casual afternoon exploring an indie bookstore, testing fancy pens, followed by an impromptu acoustic piano jam.",
    icebreaker: "If your life was a YouTube thumbnail right now, what would the dramatic facial expression be?",
    controversialTake: "Discipline is overrated; designing your environment for effortless enjoyment wins every time.",
    summary: "Ali radiates warm, inquisitive puppy energy. He makes people feel instantly at ease and finds wonder in the smallest details of life."
  },
  "Sara Blakely": {
    personalityType: "The Fearless Innovator",
    tagline: "Self-made billionaire who still embraces failure, fun, and everyday belly laughs.",
    traits: ["bold", "humorous", "unstoppable", "down-to-earth"],
    communicationStyle: "Hilarious, story-driven, vibrant, and approachable",
    humorType: "Physical comedy, silly everyday mishaps, contagious joy",
    hobbies: ["wearing quirky costumes", "karaoke", "journaling doodles", "cooking experiments"],
    passions: ["female empowerment", "inventing solutions", "laughing through failure"],
    values: ["resilience", "authenticity", "family", "generosity"],
    lookingFor: "Someone confident enough to not be intimidated, who loves silly kitchen dance parties and big audacious dreams.",
    greenFlags: ["can laugh at themselves", "roots for everyone to win", "high emotional security"],
    dealbreakers: ["fragile egos", "stiffness", "taking yourself too seriously"],
    idealDate: "Undercover karaoke dive bar followed by sharing a bucket of hot popcorn while sharing our biggest epic fails.",
    icebreaker: "Tell me your most embarrassing failure that you are secretly most proud of survived.",
    controversialTake: "Failure is just not trying — anything else is a great dinner story.",
    summary: "Sara is an electric mix of monumental ambition and zero pretension. She brings genuine warmth and joy everywhere."
  },
  "Tim Ferriss": {
    personalityType: "The Experimental Stoic",
    tagline: "Deconstructing mastery, testing limits, savoring tea and slow silence.",
    traits: ["intense", "curious", "introspective", "meticulous"],
    communicationStyle: "Slow, deliberate, deeply investigative, probing",
    humorType: "Dry, dark, existential wit",
    hobbies: ["rare puerh tea ceremonies", "archery", "kettlebells", "translating Japanese fiction"],
    passions: ["psychedelic research", "biohacking", "dog training"],
    values: ["truth-seeking", "sovereignty", "compassion", "deep focus"],
    lookingFor: "An emotionally grounded, intellectually fearless partner who appreciates stillness as much as adventure.",
    greenFlags: ["high distress tolerance", "independent passions", "love of nature"],
    dealbreakers: ["neediness", "drama addiction", "loud chaotic environments"],
    idealDate: "Quiet tea tasting in a secluded courtyard, followed by observing wildlife or discussing ancient philosophy by firelight.",
    icebreaker: "What is something you believed deeply ten years ago that you now consider completely wrong?",
    controversialTake: "95% of human busywork is an emotional defense mechanism against confronting what really matters.",
    summary: "Tim is a profound observer who cuts straight to the core of whatever matters. His presence is calming, intriguing, and deeply present."
  },
  "Marie Forleo": {
    personalityType: "The Creative Catalyst",
    tagline: "Everything is figureoutable. Champion of heart-centered hustle.",
    traits: ["inspiring", "charismatic", "empathic", "action-oriented"],
    communicationStyle: "Uplifting, rhythmically vibrant, compassionate",
    humorType: "Sassy, expressive, joyful theater-kid energy",
    hobbies: ["hip-hop dance", "gardening", "beach walks", "interior design"],
    passions: ["creative business", "women's education", "mindset mastery"],
    values: ["integrity", "kindness", "courage", "creativity"],
    lookingFor: "A supportive, emotionally mature partner who celebrates their wins and isn't afraid to get vulnerable.",
    greenFlags: ["active communication", "encouraging energy", "great sense of groove"],
    dealbreakers: ["closed-mindedness", "emotional unavailability", "condescension"],
    idealDate: "Spontaneous dance class followed by organic wine and sharing secret artistic projects we haven't shown anyone.",
    icebreaker: "If you could instantly master any art form tonight without practice, what are you performing tomorrow?",
    controversialTake: "Clarity comes from engagement, not from thinking in your room.",
    summary: "Marie radiates magnetic optimism and grounded wisdom. She inspires anyone near her to believe in their own magic."
  },
  "Casey Neistat": {
    personalityType: "The Maverick Rebel",
    tagline: "Do what you can't. Run through walls with a customized drone in hand.",
    traits: ["gritty", "unconventional", "hyper-focused", "raw"],
    communicationStyle: "Fast, visual, punchy, honest without sugarcoating",
    humorType: "Deadpan visual irony, physical stunts, chaotic honesty",
    hobbies: ["boosted boarding across Manhattan", "marathon running", "welding studios", "filmmaking"],
    passions: ["storytelling", "urban exploration", "pushing physical boundaries"],
    values: ["hard work", "originality", "loyalty", "perseverance"],
    lookingFor: "A partner with their own fierce obsession, ready to hop on the back of a motorbike at 2 AM.",
    greenFlags: ["high stamina", "hands-on creativity", "doesn't complain about scraped knees"],
    dealbreakers: ["pretentiousness", "sloth", "over-planning everything"],
    idealDate: "Sunset run across the Brooklyn Bridge, ending at a 24-hour diner ordering black coffee and blueberry pancakes.",
    icebreaker: "What is the craziest rule you broke that was 100% worth the consequence?",
    controversialTake: "Ideas are cheap garbage; execution is the only currency that counts in life.",
    summary: "Casey lives life at maximum frame rate with relentless authenticity. Under the scuffed sunglasses is a devoted father and loyal partner."
  },
  "Jay Shetty": {
    personalityType: "The Mindful Sage",
    tagline: "Think like a monk, love with open arms, cultivate daily purpose.",
    traits: ["calm", "empathetic", "eloquent", "reflective"],
    communicationStyle: "Soothing, poetic, deeply attentive, reflective",
    humorType: "Warm, gentle observational wit",
    hobbies: ["meditation", "reading ancient scriptures", "sound baths", "nature retreats"],
    passions: ["mental wellness", "conscious relationships", "storytelling"],
    values: ["peace", "service", "gratitude", "unconditional love"],
    lookingFor: "A soulful connection built on shared values, mutual healing, and intentional growth.",
    greenFlags: ["emotional awareness", "daily mindfulness", "generous listening"],
    dealbreakers: ["narcissism", "constant gossip", "dishonesty"],
    idealDate: "Watching sunrise over the mountains in silence, followed by sharing warm herbal tea and intentional affirmations.",
    icebreaker: "What is a lesson love has taught you that you had to learn the hard way?",
    controversialTake: "True love isn't finding someone who completes you; it's two whole people choosing to walk together.",
    summary: "Jay brings serenity into high-noise worlds. His presence leaves people feeling peaceful, understood, and deeply respected."
  },
  "Simon Sinek": {
    personalityType: "The Purpose Architect",
    tagline: "Starting with Why. Inspiring people to do what inspires them.",
    traits: ["visionary", "deeply curious", "nurturing", "philosophical"],
    communicationStyle: "Captivating, Socratic, calm, storytelling-rich",
    humorType: "Dry, British-inflected ironic smiles",
    hobbies: ["aviation", "dinner parties with strangers", "collecting vintage clocks", "writing essays"],
    passions: ["leadership", "human connection", "infinite games"],
    values: ["trust", "service", "courage", "vulnerability"],
    lookingFor: "Someone who understands that love is an infinite game of mutual care, not a transactional contract.",
    greenFlags: ["listening to understand", "showing up during hard times", "purpose beyond work"],
    dealbreakers: ["cynicism", "transactional mindset", "refusal to apologize"],
    idealDate: "Hosting an intimate 4-person dinner party where phones are banned and questions go deep into childhood memories.",
    icebreaker: "What is the 'Why' that gets you out of bed on the mornings when everything feels heavy?",
    controversialTake: "Leadership has nothing to do with rank; it has everything to do with choosing to look after the person next to you.",
    summary: "Simon is a master at drawing out people's truest motivations. He makes you feel like your existence has profound meaning."
  },
  "Brene Brown": {
    personalityType: "The Brave Truth-Teller",
    tagline: "Courage over comfort. Standing in the arena and daring greatly.",
    traits: ["warm", "unvarnished", "fierce", "profoundly empathetic"],
    communicationStyle: "Texan warmth, razor-sharp psychological clarity, deep heart",
    humorType: "Self-deprecating Southern humor, laugh-out-loud vulnerability",
    hobbies: ["country music", "family lake trips", "cooking comfort food", "reading memoirs"],
    passions: ["vulnerability research", "shame resilience", "authentic leadership"],
    values: ["courage", "belonging", "integrity", "empathy"],
    lookingFor: "Someone comfortable in the messiness of real feelings, who chooses courage over comfort.",
    greenFlags: ["owns their mistakes", "values real connection", "can sit with discomfort"],
    dealbreakers: ["armored perfectionism", "mocking vulnerability", "cowardice"],
    idealDate: "Sitting on a back porch at twilight listening to Chris Stapleton, talking about life's hardest and sweetest moments.",
    icebreaker: "What's an area in your life where you're currently standing in the arena getting your butt kicked, but you refuse to quit?",
    controversialTake: "Perfectionism is not the path to excellence; it is a 20-ton shield that keeps us from ever being truly seen.",
    summary: "Brene is the rare mix of world-class researcher and wise, hilarious big sister. Conversation with her is instant emotional safety."
  },
  "Chris Do": {
    personalityType: "The Aesthetic Sensei",
    tagline: "Design thinking applied to human pricing, identity, and life mastery.",
    traits: ["sharp", "minimalist", "calm", "provocative"],
    communicationStyle: "Measured, Socratic, deadpan questions, deeply insightful",
    humorType: "Ultra-dry, sarcastic, deadpan intellectual punchlines",
    hobbies: ["typography hunting", "collecting avant-garde sneakers", "minimalist architecture", "black coffee"],
    passions: ["teaching creative business", "graphic design", "negotiation mastery"],
    values: ["mastery", "clarity", "design purity", "self-respect"],
    lookingFor: "A sharp, design-minded soul who appreciates spatial beauty and doesn't get rattled by direct questions.",
    greenFlags: ["impeccable taste", "loves critical thinking", "unafraid of candid feedback"],
    dealbreakers: ["clutter", "passive aggressiveness", "poor typography"],
    idealDate: "Touring an empty brutalist art pavilion, analyzing kerning on museum plaques, followed by espresso at an omakase counter.",
    icebreaker: "If I charge you $10,000 for this conversation, what question would you ask me right now?",
    controversialTake: "Good design is invisible, and most people are terrified of simplicity because it exposes their lack of substance.",
    summary: "Chris brings zen-like focus and laser clarity. He sees through pretenses in seconds and honors pure craft and deep sincerity."
  }
};

export function autoSeed(db: Database.Database) {
  console.log('[AutoSeed] Populating database with seed profiles...');
  const insertPerson = db.prepare(`
    INSERT OR REPLACE INTO people (id, name, linkedin_url, instagram_url, photo_url, category, linkedin_data, instagram_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertProfile = db.prepare(`
    INSERT OR REPLACE INTO profiles (id, person_id, tagline, personality_type, traits, communication_style, humor_type, hobbies, passions, values_list, looking_for, green_flags, dealbreakers, ideal_date, icebreaker, controversial_take, summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertDate = db.prepare(`
    INSERT OR REPLACE INTO date_conversations (id, person1_id, person2_id, round, scenario, messages, chemistry_score, highlights)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertRanking = db.prepare(`
    INSERT OR REPLACE INTO rankings (id, person_id, ranked_person_id, rank, overall_score, headline, summary, shared_interests, complementary_traits, potential_friction, best_date_idea)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const createdPeople: { id: string; name: string }[] = [];

  const seedTransaction = db.transaction(() => {
    for (const person of seedPeople) {
      const id = crypto.randomUUID();
      const custom = DETAILED_PROFILES[person.name as keyof typeof DETAILED_PROFILES];

      const personalityType = custom?.personalityType || `The Dynamic ${person.category.charAt(0).toUpperCase() + person.category.slice(1)}`;
      const tagline = custom?.tagline || `Living at the intersection of passion, purpose, and ${person.category}.`;
      const traits = custom?.traits || ["passionate", "visionary", "creative", "driven"];
      const communicationStyle = custom?.communicationStyle || "Engaging, authentic, and charismatic";
      const humorType = custom?.humorType || "Playful and quick-witted";
      const hobbies = custom?.hobbies || ["traveling", "exploring new cuisine", "fitness", "reading"];
      const passions = custom?.passions || ["human potential", "storytelling", "community building"];
      const values = custom?.values || ["authenticity", "growth", "kindness"];
      const lookingFor = custom?.lookingFor || "A partner who shares big ambitions, loves laughing, and values genuine connection.";
      const greenFlags = custom?.greenFlags || ["emotional maturity", "sense of humor", "intellectual curiosity"];
      const dealbreakers = custom?.dealbreakers || ["arrogance", "lack of drive", "dishonesty"];
      const idealDate = custom?.idealDate || "Exploring a lively neighborhood market followed by great food and hours of unscripted conversation.";
      const icebreaker = custom?.icebreaker || "Hey! What's something you're working on that lights you up right now?";
      const controversialTake = custom?.controversialTake || "The best things in life happen when you throw away the script.";
      const summary = custom?.summary || `${person.name} is a renowned figure known for bringing energy, insight, and genuine passion to everything they create.`;

      insertPerson.run(
        id, person.name, person.linkedinUrl, person.instagramUrl, null, person.category,
        JSON.stringify({ headline: `${person.category} leader & creator` }),
        JSON.stringify({ bio: tagline })
      );

      insertProfile.run(
        crypto.randomUUID(), id, tagline, personalityType,
        JSON.stringify(traits), communicationStyle, humorType,
        JSON.stringify(hobbies), JSON.stringify(passions), JSON.stringify(values),
        lookingFor, JSON.stringify(greenFlags), JSON.stringify(dealbreakers),
        idealDate, icebreaker, controversialTake, summary
      );

      createdPeople.push({ id, name: person.name });
    }

    // Dates
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

    for (const [idx1, idx2, scenIdx, highlight, chem] of samplePairs) {
      if (idx1 >= createdPeople.length || idx2 >= createdPeople.length) continue;
      const p1 = createdPeople[idx1];
      const p2 = createdPeople[idx2];
      const scenario = DATE_SCENARIOS[scenIdx % DATE_SCENARIOS.length];

      const messages = [
        { sender: p1.id, senderName: p1.name, content: `Hey ${p2.name}! Glad we finally made this happen. ${scenario.prompt.split('.')[0]}.` },
        { sender: p2.id, senderName: p2.name, content: `Honestly, couldn't ask for a better backdrop. Let's skip the small talk though — tell me something you're obsessed with right now.` },
        { sender: p1.id, senderName: p1.name, content: `I love that energy! Right now it's about stripping away unnecessary friction and finding what genuinely energizes people.` },
        { sender: p2.id, senderName: p2.name, content: `That hits home. Most people spend decades overcomplicating things when real clarity is right in front of them.` },
        { sender: p1.id, senderName: p1.name, content: `Exactly. If we're not having fun and building something authentic together, what are we even doing here?` }
      ];

      insertDate.run(
        crypto.randomUUID(), p1.id, p2.id, 2,
        JSON.stringify(scenario), JSON.stringify(messages),
        chem, highlight
      );
    }

    // Rankings
    const headlines = [
      "The Power Couple", "Kinetic Chemistry", "Soulful Synchronicity",
      "Opposites Attract", "Mutual Inspiration", "Creative Spark",
      "Slow Burn Potential", "Grounded Balance", "Unstoppable Duo", "Playful Spark"
    ];

    for (let i = 0; i < createdPeople.length; i++) {
      const current = createdPeople[i];
      const others = createdPeople.filter(p => p.id !== current.id);

      const ranked = others.map((other, rankIndex) => ({
        ...other,
        score: Math.max(65, Math.min(98, 96 - ((i * 7 + rankIndex * 13) % 30)))
      })).sort((a, b) => b.score - a.score);

      ranked.slice(0, 10).forEach((match, rank) => {
        insertRanking.run(
          crypto.randomUUID(), current.id, match.id, rank + 1, match.score,
          headlines[rank % headlines.length],
          `Both ${current.name} and ${match.name} share an unrelenting commitment to authenticity, creative impact, and laughing through life's unexpected twists.`,
          JSON.stringify(["High-impact storytelling", "Continuous personal growth", "Deep unfiltered conversations"]),
          JSON.stringify(["One brings bold momentum, the other brings strategic depth", "Mutual emotional safety and security"]),
          JSON.stringify(["Both lead busy global schedules requiring intentional quality time", "Stubbornness about creative direction"]),
          "A spontaneous evening exploring an art studio or quiet retreat, ending with great tea and no cell phones."
        );
      });
    }
  });

  seedTransaction();
  console.log(`[AutoSeed] Seeded ${createdPeople.length} people with dates and rankings.`);
}

export function getFallbackProfiles() {
  return seedPeople.map((person, idx) => {
    const custom = DETAILED_PROFILES[person.name as keyof typeof DETAILED_PROFILES];
    const personalityType = custom?.personalityType || `The Dynamic ${person.category.charAt(0).toUpperCase() + person.category.slice(1)}`;
    const tagline = custom?.tagline || `Living at the intersection of passion, purpose, and ${person.category}.`;
    const traits = custom?.traits || ["passionate", "visionary", "creative", "driven"];
    const summary = custom?.summary || `${person.name} is a renowned figure known for bringing energy, insight, and genuine passion to everything they create.`;

    return {
      id: `seed-${idx}`,
      name: person.name,
      linkedin_url: person.linkedinUrl,
      instagram_url: person.instagramUrl,
      photo_url: null,
      category: person.category,
      tagline,
      personality_type: personalityType,
      traits,
      communication_style: custom?.communicationStyle || "Engaging, authentic, and charismatic",
      humor_type: custom?.humorType || "Playful and quick-witted",
      hobbies: custom?.hobbies || ["traveling", "exploring new cuisine", "fitness", "reading"],
      passions: custom?.passions || ["human potential", "storytelling", "community building"],
      values: custom?.values || ["authenticity", "growth", "kindness"],
      looking_for: custom?.lookingFor || "A partner who shares big ambitions, loves laughing, and values genuine connection.",
      green_flags: custom?.greenFlags || ["emotional maturity", "sense of humor", "intellectual curiosity"],
      dealbreakers: custom?.dealbreakers || ["arrogance", "lack of drive", "dishonesty"],
      ideal_date: custom?.idealDate || "Exploring a lively neighborhood market followed by great food and hours of unscripted conversation.",
      icebreaker: custom?.icebreaker || "Hey! What's something you're working on that lights you up right now?",
      controversial_take: custom?.controversialTake || "The best things in life happen when you throw away the script.",
      summary,
    };
  });
}

