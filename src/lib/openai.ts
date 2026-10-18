import OpenAI from 'openai';

const globalForOpenAI = globalThis as unknown as {
  openai: OpenAI | undefined;
};

export const openai = globalForOpenAI.openai ?? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-build-placeholder',
});

if (process.env.NODE_ENV !== 'production') globalForOpenAI.openai = openai;

export default openai;

// Helper to call GPT-4o (for quality-critical tasks like profile analysis)
export async function callGPT4o(
  systemPrompt: string,
  userPrompt: string,
  jsonMode: boolean = false
): Promise<string> {
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
}

// Helper to call GPT-4o-mini (for bulk operations like dating + scoring)
export async function callGPT4oMini(
  systemPrompt: string,
  userPrompt: string,
  jsonMode: boolean = false
): Promise<string> {
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
}

// Helper for multi-turn conversations (dating)
export async function continueConversation(
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  model: 'gpt-4o' | 'gpt-4o-mini' = 'gpt-4o-mini'
): Promise<string> {
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
}
