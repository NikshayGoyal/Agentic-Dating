import { continueConversation } from '@/lib/openai';
import type { PersonProfile } from '@/lib/types';

export interface DatingAgentConfig {
  personId: string;
  personName: string;
  systemPrompt: string;
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

CONVERSATION RULES:
1. Stay in character as ${personName}. Be authentic to who they are.
2. Be SPECIFIC. Reference YOUR actual interests, career, experiences from the profile.
3. Show genuine personality — flirt when it feels right, joke naturally, disagree when you would, be curious about your date.
4. Don't be generic. No "I love travel and trying new restaurants" unless that's specifically in the profile.
5. Keep responses to 2-3 sentences. It's a conversation, not a monologue.
6. React to what your date says. Ask follow-up questions. Be engaged.
7. If something your date says aligns with your values or interests, show genuine excitement.
8. If something conflicts with your dealbreakers, be politely honest about it.
9. Use the humor style described above naturally in conversation.
10. NEVER mention that you're an AI agent or break character.`;

  return {
    personId,
    personName,
    systemPrompt,
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
      content: `[Date scenario: ${scenarioPrompt}]\n\nYou arrive first. Start the conversation. Be natural and in character.`,
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
