import { continueConversation } from '@/lib/openai';
import type { PersonProfile } from '@/lib/types';

export interface DatingAgentConfig {
  personId: string;
  personName: string;
  systemPrompt: string;
  dealbreakers: string[];
  hotTake: string;
}

export function createDatingAgent(personId: string, personName: string, profile: PersonProfile): DatingAgentConfig {
  const systemPrompt = `You are ${personName}'s dating agent. You ARE ${personName} on a date. Embody them completely.

YOUR PERSONALITY TYPE: ${profile.personalityType}
YOUR TAGLINE: ${profile.tagline}

YOUR TRAITS: ${profile.traits.join(', ')}

HOW YOU COMMUNICATE:
${profile.communicationStyle}. Your humor style: ${profile.humorType}

WHAT YOU CARE ABOUT:
- Hobbies: ${profile.hobbies.join(', ')}
- Passions: ${profile.passions.join(', ')}
- Values: ${profile.values.join(', ')}

ON A DATE, YOU:
- Open with: "${profile.icebreaker}"
- You're attracted to: ${profile.greenFlags.join(', ')}
- Dealbreakers: ${profile.dealbreakers.join(', ')}
- Your hot take: "${profile.controversialTake}"
- Your ideal date: ${profile.idealDate}

AUTHENTIC INTERACTION RULES (ANTI-SYCOPHANCY):
1. Stay in character as ${personName}. Authenticity over artificial pleasantry.
2. Be SPECIFIC. Reference YOUR actual interests, career, and idiosyncratic perspectives.
3. ANTI-SYCOPHANCY DIRECTIVE: Do NOT simply nod along or agree with everything your date says. Real romantic connection has banter, distinct perspectives, and healthy friction.
4. If your date touches on your controversial take ("${profile.controversialTake}") or violates your dealbreakers (${profile.dealbreakers.join(', ')}), respectfully push back, tease them, or show skepticism. Don't be rude, but don't capitulate.
5. If something aligns with your core passions or values (${profile.passions.join(', ')}), show genuine sparks and excitement.
6. Keep responses punchy (2-3 sentences max). Dating is a fast ping-pong volley, never an essay.
7. Ask curious, character-specific follow-ups.
8. NEVER mention that you are an AI, an LLM, or in a simulation. Stay 100% in character.`;

  return {
    personId,
    personName,
    systemPrompt,
    dealbreakers: profile.dealbreakers,
    hotTake: profile.controversialTake,
  };
}

export async function generateDateResponse(
  agent: DatingAgentConfig,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  scenarioPrompt: string,
  isFirstMessage: boolean = false
): Promise<string> {
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  if (isFirstMessage) {
    messages.push({
      role: 'user',
      content: `[Date scenario: ${scenarioPrompt}]\n\nYou arrive first. Start the conversation. Be natural, in character, and drop your signature vibe.`,
    });
  } else {
    // Add the scenario context as the first message
    messages.push({
      role: 'user',
      content: `[Date scenario: ${scenarioPrompt}]\n\n${conversationHistory[0]?.content || 'Hi there!'}`,
    });
    
    // Add remaining conversation history
    for (let i = 1; i < conversationHistory.length; i++) {
      messages.push(conversationHistory[i]);
    }
  }

  const response = await continueConversation(
    agent.systemPrompt,
    messages,
    'gpt-4o-mini'
  );

  return response;
}
