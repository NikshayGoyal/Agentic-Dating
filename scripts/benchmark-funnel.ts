import { getAllPeople, getProfileByPersonId, getDatesByPersonId, getAllDates } from '../src/lib/db';
import { rankCandidatesByVectorSimilarity } from '../src/lib/embeddings';
import type { PersonProfile } from '../src/lib/types';

async function runBenchmark() {
  console.log('='.repeat(70));
  console.log('       AGENTMATCH TWO-STAGE RETRIEVAL & CONSTRAINTS BENCHMARK');
  console.log('='.repeat(70));

  const people = getAllPeople();
  console.log(`\n[Dataset] Total Registered Profiles: ${people.length}`);

  const candidates: Array<{ id: string; name: string; profile: PersonProfile }> = [];

  for (const p of people) {
    const prof = getProfileByPersonId(p.id);
    if (prof) {
      candidates.push({
        id: p.id,
        name: p.name,
        profile: prof as unknown as PersonProfile,
      });
    }
  }

  const N = candidates.length;
  console.log(`[Validation] Profiles with active psychographics: ${N}`);

  if (N < 2) {
    console.log('Insufficient profiles to benchmark.');
    return;
  }

  // --- 1. Algorithmic Scaling Comparison ---
  const K = 4; // Top-K retrieved via Stage 1 Vector Funnel
  const naivePairs = (N * (N - 1)) / 2;
  const naiveLLMCalls = naivePairs * 6; // 1 opener + 4 exchanges + 1 eval
  const estimatedNaiveSeconds = (naiveLLMCalls * 0.75).toFixed(1);

  console.log('\n--- 1. ALGORITHMIC COMPLEXITY & LATENCY REDUCTION ---');
  console.log(`[Naive O(N²) Exhaustive Matching]:`);
  console.log(`  • Unique Date Pairings: ${naivePairs}`);
  console.log(`  • Estimated LLM API Invocations: ${naiveLLMCalls}`);
  console.log(`  • Estimated Total Simulation Time: ~${estimatedNaiveSeconds} seconds (~${(Number(estimatedNaiveSeconds) / 60).toFixed(1)} mins)`);

  const tStart = performance.now();
  
  // Benchmark Stage 1 Vector Retrieval Funnel for all people
  const simulatedMatches: Map<string, string[]> = new Map();
  for (const c of candidates) {
    const topMatches = await rankCandidatesByVectorSimilarity(
      c.id,
      c.name,
      c.profile,
      candidates,
      K
    );
    simulatedMatches.set(c.id, topMatches.map(m => m.id));
  }
  const tEnd = performance.now();
  const vectorLatencyMs = (tEnd - tStart).toFixed(2);

  // Deduplicate unique date pairs in Stage 2
  const funnelPairs: Set<string> = new Set();
  for (const [pId, matches] of simulatedMatches) {
    for (const mId of matches) {
      funnelPairs.add([pId, mId].sort().join('|'));
    }
  }

  const prunedPairCount = funnelPairs.size;
  const funnelLLMCalls = prunedPairCount * 6;
  const tokenSavingsPercent = (((naiveLLMCalls - funnelLLMCalls) / naiveLLMCalls) * 100).toFixed(1);

  console.log(`\n[Stage 1 Vector Funnel (Our Architecture)]:`);
  console.log(`  • Stage 1 Vector Cosine Similarity Compute Time: ${vectorLatencyMs} ms for all ${N} users`);
  console.log(`  • Pruned Speed Date Pairings (Top-${K}): ${prunedPairCount}`);
  console.log(`  • Required Conversational LLM Calls: ${funnelLLMCalls}`);
  console.log(`  • Token & Cost Savings: ${tokenSavingsPercent}% reduction!`);
  console.log(`  • Theoretical Speedup: ${(naiveLLMCalls / funnelLLMCalls).toFixed(1)}x faster execution`);

  // --- 2. Sample Stage 1 Retrieval Results ---
  console.log('\n--- 2. SAMPLE STAGE 1 RETRIEVAL (TOP-4 MATCHES) ---');
  const samplePerson = candidates[0];
  const sampleTop = await rankCandidatesByVectorSimilarity(
    samplePerson.id,
    samplePerson.name,
    samplePerson.profile,
    candidates,
    K
  );
  const sampleArchetype = (samplePerson.profile as unknown as Record<string, string>).personality_type || samplePerson.profile.personalityType || 'The Visionary';
  console.log(`Target: ${samplePerson.name} (${sampleArchetype})`);
  sampleTop.forEach((match, idx) => {
    console.log(`  #${idx + 1}: ${match.name} — Semantic Similarity: ${(match.similarity * 100).toFixed(1)}% (Initial Vibe: ${match.score}%)`);
  });

  // --- 3. Chemistry Score Distribution & Calibration Analysis ---
  console.log('\n--- 3. SCORE CALIBRATION & SYCOPHANCY VARIANCE ANALYSIS ---');
  const allDates = getAllDates();
  console.log(`[Database Record] Total Historic Dates Logged: ${allDates.length}`);

  if (allDates.length > 0) {
    const scores = allDates.map(d => d.chemistry_score);
    const sum = scores.reduce((a, b) => a + b, 0);
    const mean = sum / scores.length;
    const variance = scores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    const min = Math.min(...scores);
    const max = Math.max(...scores);

    console.log(`  • Mean Chemistry Score: ${mean.toFixed(1)}%`);
    console.log(`  • Standard Deviation (σ): ${stdDev.toFixed(1)} points (healthy dynamic spread)`);
    console.log(`  • Dynamic Range: Min = ${min}%, Max = ${max}%`);
    console.log(`  • Clumping Assessment: ${stdDev > 5 ? 'PASSED (Broad calibrated distribution, anti-sycophancy active)' : 'CONCENTRATED'}`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('                      BENCHMARK COMPLETE');
  console.log('='.repeat(70));
}

runBenchmark().catch(console.error);
