import OpenAI from 'openai';

const globalForOpenAI = globalThis as unknown as {
  openai: OpenAI | undefined;
};

export const openai = globalForOpenAI.openai ?? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-build-placeholder',
});

if (process.env.NODE_ENV !== 'production') globalForOpenAI.openai = openai;

export default openai;

/**
 * Resilient API execution wrapper with exponential backoff and randomized jitter
 * to mitigate OpenAI RateLimit (429), server overloaded (500/503), or transient network timeouts.
 */
export async function withExponentialBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (error: unknown) {
      attempt++;
      const err = error as { status?: number; code?: string; message?: string };
      const isRateLimit = err?.status === 429 || err?.code === 'rate_limit_exceeded';
      const isTransient = err?.status === 500 || err?.status === 503 || err?.code === 'ETIMEDOUT';

      if ((isRateLimit || isTransient) && attempt <= maxRetries) {
        // Full jitter formula: sleep = rand(0, baseDelay * 2^attempt)
        const backoff = Math.min(10000, Math.floor(Math.random() * (baseDelayMs * Math.pow(2, attempt))));
        console.warn(`[OpenAI Resiliency] Transient error (${err?.status || err?.code}). Retrying in ${backoff}ms (attempt ${attempt}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        continue;
      }
      throw error;
    }
  }
}

// Helper to call GPT-4o (for quality-critical tasks like profile analysis)
export async function callGPT4o(
  systemPrompt: string,
  userPrompt: string,
  jsonMode: boolean = false
): Promise<string> {
  return withExponentialBackoff(async () => {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 4096,
      ...(jsonMode && { response_format: { type: 'json_object' } }),
    });
    return response.choices[0]?.message?.content || '';
  });
}

// Helper to call GPT-4o-mini (for bulk operations like dating + scoring)
export async function callGPT4oMini(
  systemPrompt: string,
  userPrompt: string,
  jsonMode: boolean = false
): Promise<string> {
  return withExponentialBackoff(async () => {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.9,
      max_tokens: 2048,
      ...(jsonMode && { response_format: { type: 'json_object' } }),
    });
    return response.choices[0]?.message?.content || '';
  });
}

// Helper for multi-turn conversations (dating)
export async function continueConversation(
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  model: 'gpt-4o' | 'gpt-4o-mini' = 'gpt-4o-mini'
): Promise<string> {
  return withExponentialBackoff(async () => {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.9,
      max_tokens: 300,
    });
    return response.choices[0]?.message?.content || '';
  });
}
