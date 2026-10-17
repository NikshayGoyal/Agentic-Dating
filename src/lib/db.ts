import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    initializeSchema(_db);
  }
  return _db;
}

function initializeSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS people (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      linkedin_url TEXT NOT NULL,
      instagram_url TEXT NOT NULL,
      photo_url TEXT,
      category TEXT,
      linkedin_data TEXT,
      instagram_data TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      person_id TEXT UNIQUE NOT NULL REFERENCES people(id) ON DELETE CASCADE,
      tagline TEXT NOT NULL,
      personality_type TEXT NOT NULL,
      traits TEXT NOT NULL,
      communication_style TEXT NOT NULL,
      humor_type TEXT NOT NULL,
      hobbies TEXT NOT NULL,
      passions TEXT NOT NULL,
      values_list TEXT NOT NULL,
      looking_for TEXT NOT NULL,
      green_flags TEXT NOT NULL,
      dealbreakers TEXT NOT NULL,
      ideal_date TEXT NOT NULL,
      icebreaker TEXT NOT NULL,
      controversial_take TEXT NOT NULL,
      summary TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS date_conversations (
      id TEXT PRIMARY KEY,
      person1_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
      person2_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
      round INTEGER NOT NULL,
      scenario TEXT NOT NULL,
      messages TEXT NOT NULL,
      chemistry_score REAL NOT NULL,
      highlights TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rankings (
      id TEXT PRIMARY KEY,
      person_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
      ranked_person_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
      rank INTEGER NOT NULL,
      overall_score REAL NOT NULL,
      headline TEXT NOT NULL,
      summary TEXT NOT NULL,
      shared_interests TEXT NOT NULL,
      complementary_traits TEXT NOT NULL,
      potential_friction TEXT NOT NULL,
      best_date_idea TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(person_id, ranked_person_id)
    );

    CREATE INDEX IF NOT EXISTS idx_profiles_person ON profiles(person_id);
    CREATE INDEX IF NOT EXISTS idx_dates_person1 ON date_conversations(person1_id);
    CREATE INDEX IF NOT EXISTS idx_dates_person2 ON date_conversations(person2_id);
    CREATE INDEX IF NOT EXISTS idx_rankings_person ON rankings(person_id);
  `);
}

// ===== Helper Functions =====

export function generateId(): string {
  return crypto.randomUUID();
}

// ===== People CRUD =====

export function createPerson(data: {
  name: string;
  linkedinUrl: string;
  instagramUrl: string;
  photoUrl?: string;
  category?: string;
  linkedinData?: string;
  instagramData?: string;
}) {
  const db = getDb();
  const id = generateId();
  db.prepare(`
    INSERT INTO people (id, name, linkedin_url, instagram_url, photo_url, category, linkedin_data, instagram_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.name, data.linkedinUrl, data.instagramUrl, data.photoUrl || null, data.category || null, data.linkedinData || null, data.instagramData || null);
  return id;
}

export function getAllPeople() {
  const db = getDb();
  return db.prepare('SELECT * FROM people ORDER BY created_at DESC').all();
}

export function getPersonById(id: string) {
  const db = getDb();
  return db.prepare('SELECT * FROM people WHERE id = ?').get(id);
}

export function updatePersonData(id: string, field: string, value: string) {
  const db = getDb();
  db.prepare(`UPDATE people SET ${field} = ? WHERE id = ?`).run(value, id);
}

// ===== Profiles CRUD =====

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
  const db = getDb();
  const id = generateId();
  db.prepare(`
    INSERT OR REPLACE INTO profiles (id, person_id, tagline, personality_type, traits, communication_style, humor_type, hobbies, passions, values_list, looking_for, green_flags, dealbreakers, ideal_date, icebreaker, controversial_take, summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, personId, profile.tagline, profile.personalityType,
    JSON.stringify(profile.traits), profile.communicationStyle, profile.humorType,
    JSON.stringify(profile.hobbies), JSON.stringify(profile.passions), JSON.stringify(profile.values),
    profile.lookingFor, JSON.stringify(profile.greenFlags), JSON.stringify(profile.dealbreakers),
    profile.idealDate, profile.icebreaker, profile.controversialTake, profile.summary
  );
  return id;
}

export function getProfileByPersonId(personId: string) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM profiles WHERE person_id = ?').get(personId) as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    ...row,
    traits: JSON.parse(row.traits as string),
    hobbies: JSON.parse(row.hobbies as string),
    passions: JSON.parse(row.passions as string),
    values: JSON.parse(row.values_list as string),
    greenFlags: JSON.parse(row.green_flags as string),
    dealbreakers: JSON.parse(row.dealbreakers as string),
  };
}

export function getAllProfiles() {
  const db = getDb();
  const rows = db.prepare(`
    SELECT p.*, pr.tagline, pr.personality_type, pr.traits, pr.communication_style,
           pr.humor_type, pr.hobbies, pr.passions, pr.values_list, pr.looking_for,
           pr.green_flags, pr.dealbreakers, pr.ideal_date, pr.icebreaker,
           pr.controversial_take, pr.summary
    FROM people p
    LEFT JOIN profiles pr ON p.id = pr.person_id
    ORDER BY p.created_at DESC
  `).all() as Record<string, unknown>[];
  
  return rows.map(row => ({
    ...row,
    traits: row.traits ? JSON.parse(row.traits as string) : [],
    hobbies: row.hobbies ? JSON.parse(row.hobbies as string) : [],
    passions: row.passions ? JSON.parse(row.passions as string) : [],
    values: row.values_list ? JSON.parse(row.values_list as string) : [],
    greenFlags: row.green_flags ? JSON.parse(row.green_flags as string) : [],
    dealbreakers: row.dealbreakers ? JSON.parse(row.dealbreakers as string) : [],
  }));
}

// ===== Date Conversations CRUD =====

export function createDateConversation(data: {
  person1Id: string;
  person2Id: string;
  round: number;
  scenario: string;
  messages: Array<{ sender: string; senderName: string; content: string }>;
  chemistryScore: number;
  highlights?: string;
}) {
  const db = getDb();
  const id = generateId();
  db.prepare(`
    INSERT INTO date_conversations (id, person1_id, person2_id, round, scenario, messages, chemistry_score, highlights)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.person1Id, data.person2Id, data.round, data.scenario, JSON.stringify(data.messages), data.chemistryScore, data.highlights || null);
  return id;
}

export function getDatesByPersonId(personId: string) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT dc.*, 
           p1.name as person1_name, p1.photo_url as person1_photo,
           p2.name as person2_name, p2.photo_url as person2_photo
    FROM date_conversations dc
    JOIN people p1 ON dc.person1_id = p1.id
    JOIN people p2 ON dc.person2_id = p2.id
    WHERE dc.person1_id = ? OR dc.person2_id = ?
    ORDER BY dc.chemistry_score DESC
  `).all(personId, personId) as Record<string, unknown>[];
  
  return rows.map(row => ({
    ...row,
    messages: JSON.parse(row.messages as string),
  }));
}

export function getAllDates() {
  const db = getDb();
  const rows = db.prepare(`
    SELECT dc.*, 
           p1.name as person1_name, p1.photo_url as person1_photo,
           p2.name as person2_name, p2.photo_url as person2_photo
    FROM date_conversations dc
    JOIN people p1 ON dc.person1_id = p1.id
    JOIN people p2 ON dc.person2_id = p2.id
    ORDER BY dc.chemistry_score DESC
  `).all() as Record<string, unknown>[];
  
  return rows.map(row => ({
    ...row,
    messages: JSON.parse(row.messages as string),
  }));
}

// ===== Rankings CRUD =====

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
  const db = getDb();
  const id = generateId();
  db.prepare(`
    INSERT OR REPLACE INTO rankings (id, person_id, ranked_person_id, rank, overall_score, headline, summary, shared_interests, complementary_traits, potential_friction, best_date_idea)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, data.personId, data.rankedPersonId, data.rank, data.overallScore,
    data.headline, data.summary, JSON.stringify(data.sharedInterests),
    JSON.stringify(data.complementaryTraits), JSON.stringify(data.potentialFriction),
    data.bestDateIdea
  );
  return id;
}

export function getRankingsByPersonId(personId: string) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT r.*, p.name as ranked_person_name, p.photo_url as ranked_person_photo,
           pr.personality_type as ranked_person_personality, pr.tagline as ranked_person_tagline
    FROM rankings r
    JOIN people p ON r.ranked_person_id = p.id
    LEFT JOIN profiles pr ON p.id = pr.person_id
    WHERE r.person_id = ?
    ORDER BY r.rank ASC
  `).all(personId) as Record<string, unknown>[];
  
  return rows.map(row => ({
    ...row,
    sharedInterests: JSON.parse(row.shared_interests as string),
    complementaryTraits: JSON.parse(row.complementary_traits as string),
    potentialFriction: JSON.parse(row.potential_friction as string),
  }));
}

export function getAllRankings() {
  const db = getDb();
  const rows = db.prepare(`
    SELECT r.*, 
           p1.name as person_name,
           p2.name as ranked_person_name, p2.photo_url as ranked_person_photo
    FROM rankings r
    JOIN people p1 ON r.person_id = p1.id
    JOIN people p2 ON r.ranked_person_id = p2.id
    ORDER BY r.person_id, r.rank ASC
  `).all() as Record<string, unknown>[];
  
  return rows.map(row => ({
    ...row,
    sharedInterests: JSON.parse(row.shared_interests as string),
    complementaryTraits: JSON.parse(row.complementary_traits as string),
    potentialFriction: JSON.parse(row.potential_friction as string),
  }));
}

// ===== Stats =====
export function getStats() {
  const db = getDb();
  const people = (db.prepare('SELECT COUNT(*) as count FROM people').get() as { count: number }).count;
  const profiles = (db.prepare('SELECT COUNT(*) as count FROM profiles').get() as { count: number }).count;
  const dates = (db.prepare('SELECT COUNT(*) as count FROM date_conversations').get() as { count: number }).count;
  const rankings = (db.prepare('SELECT COUNT(*) as count FROM rankings').get() as { count: number }).count;
  return { people, profiles, dates, rankings };
}
