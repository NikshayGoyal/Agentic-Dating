import { openai } from './openai';
import type { PersonProfile } from './types';

// In-memory cache for computed embeddings: personId -> number[]
const embeddingCache = new Map<string, number[]>();

/**
 * Generates a unified psychographic text representation of a person's profile
 * designed for high-dimensional semantic vector embedding.
 */
export function buildProfileEmbeddingText(name: string, profile: PersonProfile): string {
  const p = profile as unknown as Record<string, unknown>;
  const getStr = (...keys: string[]) => {
    for (const k of keys) {
      if (p[k] !== undefined && p[k] !== null && p[k] !== '') return String(p[k]);
    }
    return '';
  };
  const getArr = (...keys: string[]) => {
    for (const k of keys) {
      if (Array.isArray(p[k])) return (p[k] as string[]).join(', ');
    }
    return '';
  };

  return [
    `Name: ${name}`,
    `Archetype: ${getStr('personalityType', 'personality_type')}`,
    `Tagline: ${getStr('tagline')}`,
    `Communication Style: ${getStr('communicationStyle', 'communication_style')}`,
    `Humor Style: ${getStr('humorType', 'humor_type')}`,
    `Traits: ${getArr('traits')}`,
    `Hobbies: ${getArr('hobbies')}`,
    `Passions: ${getArr('passions')}`,
    `Values: ${getArr('values', 'values_list')}`,
    `Looking For: ${getStr('lookingFor', 'looking_for')}`,
    `Green Flags: ${getArr('greenFlags', 'green_flags')}`,
    `Dealbreakers: ${getArr('dealbreakers')}`,
    `Hot Take: ${getStr('controversialTake', 'controversial_take')}`,
    `Summary: ${getStr('summary')}`,
  ].filter(line => !line.endsWith(': ')).join('\n');
}

/**
 * Computes cosine similarity between two normalized vectors: cos(θ) = (A · B) / (||A|| ||B||)
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
 * Deterministic fallback embedding generator based on character 3-gram frequencies
 * for offline development, tests, or when OpenAI embedding quota is unavailable.
 */
function generateDeterministicFallbackVector(text: string, dimensions: number = 256): number[] {
  const vec = new Array(dimensions).fill(0);
  const normalized = text.toLowerCase().replace(/[^a-z0-9 ]/g, ' ');

  for (let i = 0; i < normalized.length - 2; i++) {
    const gram = normalized.slice(i, i + 3);
    let hash = 0;
    for (let j = 0; j < gram.length; j++) {
      hash = (hash << 5) - hash + gram.charCodeAt(j);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dimensions;
    vec[idx] += 1;
  }

  // L2 normalize
  let norm = 0;
  for (let i = 0; i < dimensions; i++) norm += vec[i] * vec[i];
  const mag = Math.sqrt(norm) || 1;
  return vec.map(v => v / mag);
}

/**
 * Retrieves or generates an embedding for a person's profile using text-embedding-3-small,
 * falling back to deterministic vector projection on network/API failure.
 */
export async function getProfileEmbedding(
  personId: string,
  personName: string,
  profile: PersonProfile
): Promise<number[]> {
  if (embeddingCache.has(personId)) {
    return embeddingCache.get(personId)!;
  }

  const embeddingText = buildProfileEmbeddingText(personName, profile);

  try {
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-build-placeholder') {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: embeddingText,
        dimensions: 512,
      });

      const vector = response.data[0]?.embedding;
      if (vector && vector.length > 0) {
        embeddingCache.set(personId, vector);
        return vector;
      }
    }
  } catch (error) {
    console.warn(`[Embeddings] OpenAI embedding API unavailable for ${personName}, using resilient vector fallback:`, error);
  }

  const fallbackVec = generateDeterministicFallbackVector(embeddingText, 512);
  embeddingCache.set(personId, fallbackVec);
  return fallbackVec;
}

/**
 * Stage 1 Funnel: Computes pairwise vector similarity across all candidate profiles
 * and retrieves the Top-K candidates in O(N) time without expensive LLM conversational generation.
 */
export async function rankCandidatesByVectorSimilarity(
  targetPersonId: string,
  targetPersonName: string,
  targetProfile: PersonProfile,
  candidates: Array<{ id: string; name: string; profile: PersonProfile }>,
  topK: number = 4
): Promise<Array<{ id: string; name: string; similarity: number; score: number }>> {
  const targetVector = await getProfileEmbedding(targetPersonId, targetPersonName, targetProfile);

  const scoredCandidates: Array<{ id: string; name: string; similarity: number; score: number }> = [];

  for (const candidate of candidates) {
    if (candidate.id === targetPersonId) continue;

    const candidateVector = await getProfileEmbedding(candidate.id, candidate.name, candidate.profile);
    const rawSimilarity = cosineSimilarity(targetVector, candidateVector);

    // Map cosine similarity [-1, 1] (or practically [0.2, 0.9]) to a 0-100 initial vibe score
    // with non-linear scaling to accentuate differences
    const normalizedScore = Math.round(Math.min(100, Math.max(0, ((rawSimilarity - 0.2) / 0.7) * 100)));

    scoredCandidates.push({
      id: candidate.id,
      name: candidate.name,
      similarity: rawSimilarity,
      score: normalizedScore,
    });
  }

  // Sort descending by similarity
  scoredCandidates.sort((a, b) => b.similarity - a.similarity);

  return scoredCandidates.slice(0, topK);
}
