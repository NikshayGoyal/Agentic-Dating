// ===== Scraped Data Types =====

export interface LinkedInData {
  name: string;
  headline: string;
  about: string;
  location: string;
  currentRole: string;
  company: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description?: string;
  }>;
  skills: string[];
  education: Array<{
    school: string;
    degree: string;
    field?: string;
  }>;
  profileImageUrl?: string;
}

export interface InstagramData {
  username: string;
  fullName: string;
  bio: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  profilePicUrl: string;
  recentCaptions: string[];  // Last 12 post captions
  isVerified: boolean;
}

export interface ScrapedData {
  linkedin: LinkedInData | null;
  instagram: InstagramData | null;
  scrapedAt: string;
  errors: string[];
}

// ===== Profile Types =====

export interface PersonProfile {
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
}

// ===== Dating Types =====

export interface DateMessage {
  sender: string;       // personId
  senderName: string;
  content: string;
}

export interface DateScenario {
  id: string;
  emoji: string;
  title: string;
  setting: string;
  prompt: string;
}

export interface DateResult {
  person1Id: string;
  person2Id: string;
  round: number;
  scenario: DateScenario;
  messages: DateMessage[];
  chemistryScore: number;
  highlights: string;
}

// ===== Ranking Types =====

export interface CompatibilityReport {
  rank: number;
  overallScore: number;
  headline: string;
  summary: string;
  sharedInterests: string[];
  complementaryTraits: string[];
  potentialFriction: string[];
  bestDateIdea: string;
}

export interface PersonWithProfile {
  id: string;
  name: string;
  linkedinUrl: string;
  instagramUrl: string;
  photoUrl: string | null;
  category: string | null;
  profile: PersonProfile | null;
  createdAt: string;
}

export interface PersonWithRelations {
  id: string;
  name: string;
  linkedinUrl: string;
  instagramUrl: string;
  photoUrl: string | null;
  category: string | null;
  linkedinData: string | null;
  instagramData: string | null;
  profile: {
    id: string;
    tagline: string;
    personalityType: string;
    traits: string;
    communicationStyle: string;
    humorType: string;
    hobbies: string;
    passions: string;
    values: string;
    lookingFor: string;
    greenFlags: string;
    dealbreakers: string;
    idealDate: string;
    icebreaker: string;
    controversialTake: string;
    summary: string;
  } | null;
  datesAsPerson1: Array<{
    id: string;
    person2Id: string;
    round: number;
    scenario: string;
    messages: string;
    chemistryScore: number;
    highlights: string | null;
  }>;
  datesAsPerson2: Array<{
    id: string;
    person1Id: string;
    round: number;
    scenario: string;
    messages: string;
    chemistryScore: number;
    highlights: string | null;
  }>;
  rankingsFor: Array<{
    id: string;
    rankedPersonId: string;
    rank: number;
    overallScore: number;
    headline: string;
    summary: string;
    sharedInterests: string;
    complementaryTraits: string;
    potentialFriction: string;
    bestDateIdea: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Pipeline Types =====

export type PipelineStep = 
  | 'scraping_linkedin'
  | 'scraping_instagram'
  | 'analyzing_profile'
  | 'running_vibe_check'
  | 'speed_dating'
  | 'generating_rankings'
  | 'complete';

export interface PipelineStatus {
  step: PipelineStep;
  progress: number;       // 0-100
  message: string;
  personId?: string;
}

// ===== Seed Data Types =====

export interface SeedPerson {
  name: string;
  linkedinUrl: string;
  instagramUrl: string;
  category: 'tech' | 'creator' | 'designer' | 'fitness' | 'educator';
}

// ===== Date Scenarios =====

export const DATE_SCENARIOS: DateScenario[] = [
  {
    id: 'coffee_shop',
    emoji: '☕',
    title: 'Coffee Shop First Date',
    setting: 'A cozy coffee shop on a rainy afternoon',
    prompt: "You're meeting for the first time at a quiet coffee shop. The rain is pattering on the windows. Break the ice and get to know each other."
  },
  {
    id: 'rooftop_party',
    emoji: '🎉',
    title: 'Rooftop Party',
    setting: 'A rooftop party with city lights in the background',
    prompt: "You've just been introduced at a rooftop party. The music is good, the view is incredible, and you've got a drink in hand. Make your impression."
  },
  {
    id: 'late_night_texts',
    emoji: '🌙',
    title: 'Late Night Texts',
    setting: "It's 1 AM and neither of you can sleep",
    prompt: "It's 1 AM. You're both still awake and started texting. The conversation gets real when the world is quiet. Go deep."
  },
  {
    id: 'art_gallery',
    emoji: '🎨',
    title: 'Art Gallery Debate',
    setting: 'A modern art gallery with questionable exhibits',
    prompt: "You're both staring at the same weird art piece, and you both have opinions. Bond over your takes on art, culture, and pretentiousness."
  },
  {
    id: 'airport_delay',
    emoji: '✈️',
    title: 'Airport Delay',
    setting: 'Stuck at the airport — 6-hour delay',
    prompt: "Your flights are both delayed by 6 hours. You're sitting next to each other at the gate. You've got nothing but time."
  },
  {
    id: 'cooking_class',
    emoji: '👨‍🍳',
    title: 'Cooking Class Gone Wrong',
    setting: 'A cooking class where everything is going wrong',
    prompt: "You're paired up in a cooking class and your dish is a disaster. Bond over the chaos and figure out how to salvage dinner together."
  },
  {
    id: 'bookstore',
    emoji: '📚',
    title: 'Bookstore Browse',
    setting: 'A quiet independent bookstore',
    prompt: "You keep bumping into each other in different sections of a bookstore. What you're reading says a lot about you — share your picks."
  },
  {
    id: 'hiking_trail',
    emoji: '🏔️',
    title: 'Surprise Trail Encounter',
    setting: 'A scenic hiking trail with an amazing view at the top',
    prompt: "You've both reached the summit at the same time. The view is breathtaking. You start talking about what brought you here — and where you're headed in life."
  },
];
