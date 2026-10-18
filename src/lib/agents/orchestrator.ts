import { callGPT4oMini } from '@/lib/openai';
import { createDatingAgent, generateDateResponse, type DatingAgentConfig } from './dater';
import { getProfileByPersonId, getPersonById, createDateConversation } from '@/lib/db';
import { rankCandidatesByVectorSimilarity } from '@/lib/embeddings';
import { DATE_SCENARIOS, type DateMessage, type DateScenario, type PersonProfile } from '@/lib/types';

// Concurrency limiter with promise pooling
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
      executing.splice(executing.findIndex(e => e === p), 1);
    }
  }

  await Promise.all(executing);
  return results;
}

// ===== Round 1: Fast Stage-1 Semantic Vector Filter + Vibe Check =====

interface VibeScore {
  personId: string;
  targetId: string;
  score: number;
  reason: string;
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

  // Evaluate chemistry with calibrated psychometric rubric
  const { chemistryScore, highlights } = await evaluateChemistry(
    agent1,
    agent2,
    messages,
    scenario
  );

  return { messages, chemistryScore, highlights };
}

/**
 * Calibrated 5-tier psychometric chemistry evaluation with Chain-of-Thought (CoT)
 * and anti-sycophancy penalty to eliminate score clumping.
 */
async function evaluateChemistry(
  agent1: DatingAgentConfig,
  agent2: DatingAgentConfig,
  messages: DateMessage[],
  scenario: DateScenario
): Promise<{ chemistryScore: number; highlights: string }> {
  const convoText = messages.map(m => `${m.senderName}: ${m.content}`).join('\n');

  const systemPrompt = `You are a calibrated, rigorous relationship psychologist evaluating dating chemistry between two individuals.

SCORING RUBRIC (CALIBRATED DISTRIBUTION):
- 0-35 (Clash / Dealbreaker / Sterile): One-sided monologue, awkward disconnect, or clear clash with core values/dealbreakers.
- 36-55 (Polite Acquaintance / No Spark): Cordial small talk, surface-level agreement, pleasant but lacks wit, banter, or romantic tension.
- 56-75 (Solid Connection): Natural conversational flow, shared interests, mutual engagement, comfortable banter.
- 76-90 (High Chemistry): Electric banter, spontaneous humor, playful teasing, mutual vulnerability, undeniable spark.
- 91-100 (Exceptional Soulmate Tier): Rare conversational synchronicity, effortless flow, complementary philosophies.

ANTI-INFLATION & ANTI-SYCOPHANCY PENALTIES:
- Deduct 15 points if the conversation is purely polite flattery with zero playful friction or authenticity.
- If either person's dealbreakers are violated or clashed without resolution, score MUST NOT exceed 40.
- Most average first dates score between 48 and 68. DO NOT default to 75-85 unless genuine spark is evident.

Respond with JSON:
{
  "reasoning": "2-sentence psychometric evaluation justifying the score based on the rubric",
  "score": 0-100,
  "highlights": "The single most memorable exchange or turning point in 1-2 sentences"
}`;

  const userPrompt = `Date Scenario: ${scenario.title} — ${scenario.setting}
${agent1.personName}'s Dealbreakers: ${agent1.dealbreakers.join(', ') || 'None specified'} | Hot Take: "${agent1.hotTake || 'None'}"
${agent2.personName}'s Dealbreakers: ${agent2.dealbreakers.join(', ') || 'None specified'} | Hot Take: "${agent2.hotTake || 'None'}"

Conversation:
${convoText}

Evaluate the chemistry between ${agent1.personName} and ${agent2.personName}.`;

  try {
    const response = await callGPT4oMini(systemPrompt, userPrompt, true);
    const parsed = JSON.parse(response);
    return {
      chemistryScore: Math.min(100, Math.max(0, parsed.score || 55)),
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
  const profiles: Map<string, { id: string; name: string; profile: PersonProfile }> = new Map();
  
  for (const id of personIds) {
    const profile = getProfileByPersonId(id);
    const person = getPersonById(id) as { name: string } | undefined;
    if (profile && person) {
      profiles.set(id, { id, name: person.name, profile: profile as unknown as PersonProfile });
    }
  }

  const validIds = Array.from(profiles.keys());
  if (validIds.length < 2) {
    throw new Error('Need at least 2 people with profiles to run dating simulation');
  }

  // ===== ROUND 1: Two-Stage Funnel (Semantic Vector Filter) =====
  report('vibe_check', 0, validIds.length, 'Executing Stage 1 Semantic Vector Funnel...');
  
  const allCandidates = validIds.map(id => {
    const p = profiles.get(id)!;
    return { id, name: p.name, profile: p.profile };
  });

  const topMatchesPerPerson: Map<string, string[]> = new Map();
  
  for (let i = 0; i < validIds.length; i++) {
    const personId = validIds[i];
    const { name, profile } = profiles.get(personId)!;
    
    // Fast O(N) vector similarity retrieval, picking top 4 candidates
    const rankedMatches = await rankCandidatesByVectorSimilarity(
      personId,
      name,
      profile,
      allCandidates,
      4
    );

    topMatchesPerPerson.set(personId, rankedMatches.map(m => m.id));
    report('vibe_check', i + 1, validIds.length, `Vector filtered matches for: ${name}`);
  }

  // Deduplicate pairs for speed dates (O(N * K) instead of O(N^2))
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

  // ===== ROUND 2: Speed Dates on Pruned Top-K Pairs =====
  report('speed_dating', 0, datePairs.length, `Starting ${datePairs.length} targeted speed dates...`);

  // Create agents for all people
  const agents: Map<string, DatingAgentConfig> = new Map();
  for (const personId of validIds) {
    const { name, profile } = profiles.get(personId)!;
    agents.set(personId, createDatingAgent(personId, name, profile));
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

  await runWithConcurrency(dateTasks, 4);

  report('complete', datePairs.length, datePairs.length, 'Dating simulation complete!');
}

// ===== Two-Stage Funnel execution for a single newly ingested person =====

export async function runDatingForNewPerson(
  newPersonId: string,
  existingPersonIds: string[]
): Promise<void> {
  const newProfile = getProfileByPersonId(newPersonId);
  const newPerson = getPersonById(newPersonId) as { name: string } | undefined;
  
  if (!newProfile || !newPerson) {
    throw new Error('New person profile not found');
  }

  const typedNewProfile = newProfile as unknown as PersonProfile;

  // STAGE 1: Fast O(N) Semantic Vector Filter
  // Collect all available candidates
  const candidatePool: Array<{ id: string; name: string; profile: PersonProfile }> = [];
  for (const id of existingPersonIds) {
    const prof = getProfileByPersonId(id);
    const pers = getPersonById(id) as { name: string } | undefined;
    if (prof && pers) {
      candidatePool.push({ id, name: pers.name, profile: prof as unknown as PersonProfile });
    }
  }

  // Filter candidate pool to Top-4 matches using vector cosine similarity
  // This prunes 28 potential simulations down to 4 (saving >85% tokens and preventing server timeouts)
  const topCandidates = await rankCandidatesByVectorSimilarity(
    newPersonId,
    newPerson.name,
    typedNewProfile,
    candidatePool,
    4
  );

  console.log(`[Stage 1 Funnel] Pruned candidate pool from ${candidatePool.length} to Top ${topCandidates.length}:`, 
    topCandidates.map(c => `${c.name} (${Math.round(c.similarity * 100)}% match)`).join(', ')
  );

  const newAgent = createDatingAgent(newPersonId, newPerson.name, typedNewProfile);

  // STAGE 2: Multi-turn Date Simulation ONLY for Top-K Candidates
  for (let i = 0; i < topCandidates.length; i++) {
    const targetCandidate = topCandidates[i];
    const targetProfile = getProfileByPersonId(targetCandidate.id);
    if (!targetProfile) continue;

    const existingAgent = createDatingAgent(
      targetCandidate.id,
      targetCandidate.name,
      targetProfile as unknown as PersonProfile
    );

    const scenario = DATE_SCENARIOS[i % DATE_SCENARIOS.length];

    try {
      const result = await runSpeedDate(newAgent, existingAgent, scenario);
      
      createDateConversation({
        person1Id: newPersonId,
        person2Id: targetCandidate.id,
        round: 2,
        scenario: JSON.stringify(scenario),
        messages: result.messages,
        chemistryScore: result.chemistryScore,
        highlights: result.highlights,
      });

      console.log(`Date: ${newPerson.name} ❤️ ${targetCandidate.name}: ${result.chemistryScore}%`);
    } catch (error) {
      console.error(`Date error for ${newPerson.name} & ${targetCandidate.name}:`, error);
    }
  }
}
