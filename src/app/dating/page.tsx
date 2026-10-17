'use client';

import { useState, useEffect } from 'react';

interface DateConvo {
  id: string;
  person1_id: string;
  person2_id: string;
  person1_name: string;
  person2_name: string;
  person1_photo: string | null;
  person2_photo: string | null;
  round: number;
  scenario: string;
  messages: Array<{ sender: string; senderName: string; content: string }>;
  chemistry_score: number;
  highlights: string | null;
}

export default function DatingPage() {
  const [dates, setDates] = useState<DateConvo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dates')
      .then(res => res.json())
      .then(data => {
        setDates(data.dates || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function parseScenario(scenarioStr: string) {
    try {
      return JSON.parse(scenarioStr);
    } catch {
      return { emoji: '💬', title: 'Date', setting: '' };
    }
  }

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">💬 Agent Dates</h1>
          <p className="mt-2 text-gray-400">
            {dates.length} dating conversations between AI agents
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-500">Loading dates...</div>
        ) : dates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-700 p-12 text-center">
            <p className="text-lg text-gray-500">
              No dates yet. Add people and run the dating simulation!
            </p>
          </div>
        ) : (
          <div className="space-y-4 stagger-children">
            {dates.map((date) => {
              const scenario = parseScenario(date.scenario);
              const isExpanded = expandedId === date.id;

              return (
                <div
                  key={date.id}
                  className="rounded-2xl border border-gray-800 bg-gray-900/50 overflow-hidden transition-all"
                >
                  {/* Header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : date.id)}
                    className="flex w-full items-center gap-4 p-5 text-left hover:bg-gray-800/30 transition"
                  >
                    {/* Avatars */}
                    <div className="flex -space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-xs font-bold text-white ring-2 ring-gray-900">
                        {getInitials(date.person1_name)}
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-xs font-bold text-white ring-2 ring-gray-900">
                        {getInitials(date.person2_name)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white">
                        {date.person1_name} & {date.person2_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {scenario.emoji} {scenario.title}
                      </div>
                    </div>

                    {/* Chemistry Score */}
                    <div className={`rounded-full px-3 py-1 text-sm font-bold ${
                      date.chemistry_score >= 75 ? 'bg-emerald-500/20 text-emerald-400' :
                      date.chemistry_score >= 50 ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {Math.round(date.chemistry_score)}%
                    </div>

                    <svg
                      className={`h-5 w-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded Conversation */}
                  {isExpanded && (
                    <div className="border-t border-gray-800 p-5">
                      {/* Scenario banner */}
                      <div className="mb-5 rounded-xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-500/20 p-4 text-center">
                        <div className="text-3xl mb-1">{scenario.emoji}</div>
                        <div className="font-semibold text-white">{scenario.title}</div>
                        <div className="text-sm text-gray-400">{scenario.setting}</div>
                      </div>

                      {/* Messages */}
                      <div className="space-y-3 mb-5">
                        {date.messages.map((msg, i) => {
                          const isPerson1 = msg.sender === date.person1_id;
                          return (
                            <div
                              key={i}
                              className={`flex ${isPerson1 ? 'justify-start' : 'justify-end'} ${isPerson1 ? 'chat-left' : 'chat-right'}`}
                              style={{ animationDelay: `${i * 0.1}s` }}
                            >
                              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                isPerson1
                                  ? 'rounded-bl-md bg-gray-800 text-gray-200'
                                  : 'rounded-br-md bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-gray-200'
                              }`}>
                                <div className={`mb-1 text-xs font-medium ${isPerson1 ? 'text-amber-400' : 'text-rose-400'}`}>
                                  {msg.senderName}
                                </div>
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Highlights */}
                      {date.highlights && (
                        <div className="rounded-xl bg-gray-800/50 p-4 border-l-4 border-amber-500">
                          <div className="text-xs font-medium text-amber-500 mb-1">✨ HIGHLIGHT</div>
                          <p className="text-sm text-gray-300 italic">{date.highlights}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
