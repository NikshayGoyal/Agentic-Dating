import { callGPT4oMini } from '@/lib/openai';
import { createDatingAgent, generateDateResponse, type DatingAgentConfig } from './dater';
import { getProfileByPersonId, getPersonById, createDateConversation, getDatesByPersonId } from '@/lib/db';
import { DATE_SCENARIOS, type DateMessage, type DateScenario } from '@/lib/types';

// Concurrency limiter
async function runWithConcurrency<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (const task of tasks) {
    const p = task().then(result => {
      results.push(result);
    });
    executing.push(p);

    if (executing.length >= limit) {
      await Promise.race(executing);
      executing.splice(0, executing.findIndex(e => e === p) + 1);
    }
  }

  await Promise.all(executing);
  return results;
}

// ===== Round 1: Vibe Check (Quick Compatibility Scoring) =====

interface VibeScore {
  personId: string;
  targetId: string;
  score: number;
  reason: string;
}

async function vibeCheckForPerson(
  personId: string,
  personName: string,
  personProfileSummary: string,
  otherPeople: Array<{ id: string; name: string; summary: string }>
): Promise<VibeScore[]> {
  const systemPrompt = `You are a dating compatibility expert. Given a person's profile and a list of potential matches, score each match's compatibility from 0-100.

Consider: shared interests, complementary personalities, values alignment, potential chemistry, communication style compatibility.

Respond with a JSON object: { "scores": [{ "id": "person_id", "score": 0-100, "reason": "one-sentence reason" }] }`;

  const othersList = otherPeople.map(p => `- ID: ${p.id} | Name: ${p.name} | Profile: ${p.summary}`).join('\n');

  const userPrompt = `Person: ${personName}
Profile: ${personProfileSummary}

Rate compatibility with each of these people:
${othersList}`;

  try {
    const response = await callGPT4oMini(systemPrompt, userPrompt, true);
    const parsed = JSON.parse(response);
    const scores = parsed.scores || [];
    
    return scores.map((s: { id: string; score: number; reason: string }) => ({
      personId,
      targetId: s.id,
      score: Math.min(100, Math.max(0, s.score || 50)),
      reason: s.reason || 'Potential connection',
    }));
  } catch (error) {
    console.error(`Vibe check error for ${personName}:`, error);
    return otherPeople.map(p => ({
      personId,
      targetId: p.id,
      score: 50,
      reason: 'Could be interesting',
    }));
  }
}

// ===== Round 2: Speed Dates =====

async function runSpeedDate(
  agent1: DatingAgentConfig,
  agent2: DatingAgentConfig,
  scenario: DateScenario,
  numExchanges: number = 5
): Promise<{ messages: DateMessage[]; chemistryScore: number; highlights: string }> {
  const messages: DateMessage[] = [];
  const agent1History: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  const agent2History: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  // Agent 1 starts the conversation
  const opener = await generateDateResponse(agent1, [], scenario.prompt, true);
  messages.push({ sender: agent1.personId, senderName: agent1.personName, content: opener });
  agent1History.push({ role: 'assistant', content: opener });
  agent2History.push({ role: 'user', content: opener });

  // Alternate conversation
  for (let i = 1; i < numExchanges * 2 - 1; i++) {
    const isAgent1Turn = i % 2 === 0;
    const currentAgent = isAgent1Turn ? agent1 : agent2;
    const currentHistory = isAgent1Turn ? agent1History : agent2History;

    const response = await generateDateResponse(currentAgent, currentHistory, scenario.prompt, false);
    
    messages.push({
      sender: currentAgent.personId,
      senderName: currentAgent.personName,
      content: response,
    });

    // Update both histories
    if (isAgent1Turn) {
      agent1History.push({ role: 'assistant', content: response });
      agent2History.push({ role: 'user', content: response });
    } else {
      agent2History.push({ role: 'assistant', content: response });
      agent1History.push({ role: 'user', content: response });
    }
  }

  // Evaluate chemistry
  const { chemistryScore, highlights } = await evaluateChemistry(
    agent1.personName,
    agent2.personName,
    messages,
    scenario
  );

  return { messages, chemistryScore, highlights };
}

async function evaluateChemistry(
  person1Name: string,
  person2Name: string,
  messages: DateMessage[],
  scenario: DateScenario
): Promise<{ chemistryScore: number; highlights: string }> {
  const convoText = messages.map(m => `${m.senderName}: ${m.content}`).join('\n');

  const systemPrompt = `You evaluate dating chemistry between two people based on their conversation. 
Score from 0-100 and identify the best moment.
Respond as JSON: { "score": 0-100, "highlights": "The best/most memorable moment from this date in 1-2 sentences" }`;

  const userPrompt = `Date scenario: ${scenario.title} — ${scenario.setting}

Conversation:
${convoText}

Evaluate the chemistry between ${person1Name} and ${person2Name}.`;

  try {
    const response = await callGPT4oMini(systemPrompt, userPrompt, true);
    const parsed = JSON.parse(response);
    return {
      chemistryScore: Math.min(100, Math.max(0, parsed.score || 50)),
      highlights: parsed.highlights || 'An interesting conversation with moments of connection.',
    };
  } catch {
    return { chemistryScore: 50, highlights: 'The conversation had its moments.' };
  }
}

// ===== Main Orchestrator =====

export interface SimulationProgress {
  phase: string;
  current: number;
  total: number;
  message: string;
}

export async function runDatingSimulation(
  personIds: string[],
  onProgress?: (progress: SimulationProgress) => void
): Promise<void> {
  const report = (phase: string, current: number, total: number, message: string) => {
    onProgress?.({ phase, current, total, message });
    console.log(`[${phase}] ${current}/${total}: ${message}`);
  };

  // Load all profiles
  const profiles: Map<string, { id: string; name: string; profile: ReturnType<typeof getProfileByPersonId> }> = new Map();
  
  for (const id of personIds) {
    const profile = getProfileByPersonId(id);
    const person = getPersonById(id) as { name: string } | undefined;
    if (profile && person) {
      profiles.set(id, { id, name: person.name, profile });
    }
  }

  const validIds = Array.from(profiles.keys());
  if (validIds.length < 2) {
    throw new Error('Need at least 2 people with profiles to run dating simulation');
  }

  // ===== ROUND 1: Vibe Check =====
  report('vibe_check', 0, validIds.length, 'Starting vibe check round...');
  
  const vibeScores: Map<string, VibeScore[]> = new Map();
  
  const vibeCheckTasks = validIds.map((personId, index) => async () => {
    const { name, profile } = profiles.get(personId)!;
    const others = validIds
      .filter(id => id !== personId)
      .map(id => {
        const p = profiles.get(id)!;
        return { id, name: p.name, summary: (p.profile as { summary?: string })?.summary || '' };
      });
    
    const scores = await vibeCheckForPerson(personId, name, (profile as { summary?: string })?.summary || '', others);
    vibeScores.set(personId, scores);
    report('vibe_check', index + 1, validIds.length, `Vibe checked: ${name}`);
  });

  await runWithConcurrency(vibeCheckTasks, 5);

  // ===== Determine top matches =====
  const topMatchesPerPerson: Map<string, string[]> = new Map();
  
  for (const personId of validIds) {
    const scores = vibeScores.get(personId) || [];
    const sorted = scores.sort((a, b) => b.score - a.score);
    const topN = Math.min(8, sorted.length);
    topMatchesPerPerson.set(personId, sorted.slice(0, topN).map(s => s.targetId));
  }

  // Deduplicate pairs for speed dates
  const uniquePairs: Set<string> = new Set();
  const datePairs: Array<[string, string]> = [];

  for (const [personId, matches] of topMatchesPerPerson) {
    for (const matchId of matches) {
      const pairKey = [personId, matchId].sort().join('|');
      if (!uniquePairs.has(pairKey)) {
        uniquePairs.add(pairKey);
        datePairs.push([personId, matchId]);
      }
    }
  }

  // ===== ROUND 2: Speed Dates =====
  report('speed_dating', 0, datePairs.length, `Starting ${datePairs.length} speed dates...`);

  // Create agents for all people
  const agents: Map<string, DatingAgentConfig> = new Map();
  for (const personId of validIds) {
    const { name, profile } = profiles.get(personId)!;
    const profileData = profile as unknown as import('@/lib/types').PersonProfile;
    agents.set(personId, createDatingAgent(personId, name, profileData));
  }

  // Run speed dates with concurrency limit
  const dateTasks = datePairs.map(([id1, id2], index) => async () => {
    const agent1 = agents.get(id1)!;
    const agent2 = agents.get(id2)!;
    const scenario = DATE_SCENARIOS[index % DATE_SCENARIOS.length];

    try {
      const result = await runSpeedDate(agent1, agent2, scenario);
      
      // Save to database
      createDateConversation({
        person1Id: id1,
        person2Id: id2,
        round: 2,
        scenario: JSON.stringify(scenario),
        messages: result.messages,
        chemistryScore: result.chemistryScore,
        highlights: result.highlights,
      });

      report('speed_dating', index + 1, datePairs.length, 
        `${agent1.personName} ❤️ ${agent2.personName}: ${result.chemistryScore}% chemistry`);
    } catch (error) {
      console.error(`Speed date error for ${agent1.personName} & ${agent2.personName}:`, error);
    }
  });

  await runWithConcurrency(dateTasks, 3);

  report('complete', datePairs.length, datePairs.length, 'Dating simulation complete!');
}

// ===== Run for a single new person against existing pool =====

export async function runDatingForNewPerson(
  newPersonId: string,
  existingPersonIds: string[]
): Promise<void> {
  const newProfile = getProfileByPersonId(newPersonId);
  const newPerson = getPersonById(newPersonId) as { name: string } | undefined;
  
  if (!newProfile || !newPerson) {
    throw new Error('New person profile not found');
  }

  const newAgent = createDatingAgent(newPersonId, newPerson.name, newProfile as unknown as import('@/lib/types').PersonProfile);

  // Run speed dates with each existing person
  for (let i = 0; i < existingPersonIds.length; i++) {
    const existingProfile = getProfileByPersonId(existingPersonIds[i]);
    const existingPerson = getPersonById(existingPersonIds[i]) as { name: string } | undefined;
    
    if (!existingProfile || !existingPerson) continue;

    const existingAgent = createDatingAgent(
      existingPersonIds[i], 
      existingPerson.name, 
      existingProfile as unknown as import('@/lib/types').PersonProfile
    );

    const scenario = DATE_SCENARIOS[i % DATE_SCENARIOS.length];

    try {
      const result = await runSpeedDate(newAgent, existingAgent, scenario);
      
      createDateConversation({
        person1Id: newPersonId,
        person2Id: existingPersonIds[i],
        round: 2,
        scenario: JSON.stringify(scenario),
        messages: result.messages,
        chemistryScore: result.chemistryScore,
        highlights: result.highlights,
      });

      console.log(`Date: ${newPerson.name} ❤️ ${existingPerson.name}: ${result.chemistryScore}%`);
    } catch (error) {
      console.error(`Date error:`, error);
    }
  }
}
