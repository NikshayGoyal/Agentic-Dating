'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    fetch('/api/dates')
      .then(res => res.json())
      .then(data => {
        const d = data.dates || [];
        setDates(d);
        if (d.length > 0) {
          // Auto-expand the highest chemistry date for instant visual impact
          setExpandedId(d[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function parseScenario(scenarioStr: string) {
    try {
      return JSON.parse(scenarioStr);
    } catch {
      return { emoji: '💬', title: 'Speed Date', setting: 'Conversational interaction' };
    }
  }

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  const filteredDates = dates.filter(date => {
    if (filter === 'high') return date.chemistry_score >= 80;
    if (filter === 'medium') return date.chemistry_score >= 60 && date.chemistry_score < 80;
    if (filter === 'low') return date.chemistry_score < 60;
    return true;
  });

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header with Recruiter Badge */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300 mb-3">
            <span>✨</span> Multi-Turn Persona Roleplay & Dialogue Evaluation
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            💬 Simulated Agent Speed Dates
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            AI agents embody their real-world counterparts, engaging in 5-turn dynamic improvisational dates across unpredictable scenarios.
          </p>

          {/* Filter Bar */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-400 font-medium mr-2">Chemistry Filter:</span>
            {[
              { id: 'all', label: `All Transcripts (${dates.length})` },
              { id: 'high', label: '🔥 High Chemistry (≥80%)' },
              { id: 'medium', label: '⚡ Sparks & Banter (60-79%)' },
              { id: 'low', label: '❄️ Awkward / Friction (<60%)' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as typeof filter)}
                className={`rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
                  filter === f.id
                    ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                    : 'bg-zinc-900 border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center text-zinc-500 font-mono text-sm">
            <span className="h-5 w-5 inline-block border-2 border-rose-500 border-t-transparent rounded-full animate-spin mr-2" />
            Loading date transcripts...
          </div>
        ) : filteredDates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center text-zinc-500">
            No dates found matching this filter.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDates.map((date) => {
              const scenario = parseScenario(date.scenario);
              const isExpanded = expandedId === date.id;
              const isHighChem = date.chemistry_score >= 80;

              return (
                <div
                  key={date.id}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isExpanded
                      ? 'border-amber-500/40 bg-zinc-900/90 shadow-xl shadow-amber-500/5'
                      : 'border-white/[0.08] bg-zinc-900/50 hover:border-zinc-700'
                  }`}
                >
                  {/* Collapsible Header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : date.id)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Avatar Pair */}
                      <div className="flex -space-x-3 shrink-0">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-xs font-bold text-white ring-2 ring-zinc-950 shadow-md">
                          {getInitials(date.person1_name)}
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-xs font-bold text-white ring-2 ring-zinc-950 shadow-md">
                          {getInitials(date.person2_name)}
                        </div>
                      </div>

                      {/* Names & Scenario */}
                      <div className="min-w-0">
                        <div className="font-bold text-white text-base truncate flex items-center gap-2">
                          <span>{date.person1_name}</span>
                          <span className="text-zinc-600 font-normal">&</span>
                          <span>{date.person2_name}</span>
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2 truncate">
                          <span>{scenario.emoji} {scenario.title}</span>
                          <span>•</span>
                          <span className="text-zinc-400 truncate max-w-[200px] sm:max-w-xs">{scenario.setting}</span>
                        </div>
                      </div>
                    </div>

                    {/* Chemistry Score Badge */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className={`rounded-xl px-3 py-1.5 text-center font-bold text-xs ${
                        isHighChem
                          ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : date.chemistry_score >= 60
                          ? 'border border-amber-500/30 bg-amber-500/10 text-amber-300'
                          : 'border border-rose-500/30 bg-rose-500/10 text-rose-400'
                      }`}>
                        <div className="text-sm sm:text-base leading-none font-black">{Math.round(date.chemistry_score)}%</div>
                        <div className="text-[9px] uppercase tracking-wider opacity-75">Chemistry</div>
                      </div>

                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800/80 text-zinc-400 transition-transform ${isExpanded ? 'rotate-180 text-white' : ''}`}>
                        ▼
                      </div>
                    </div>
                  </button>

                  {/* Expanded Conversation Viewer */}
                  {isExpanded && (
                    <div className="border-t border-white/[0.08] p-5 sm:p-6 bg-zinc-950/60">
                      {/* Scenario Context Banner */}
                      <div className="mb-6 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-zinc-900 to-rose-500/10 p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{scenario.emoji}</span>
                          <div>
                            <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                              Scenario: {scenario.title}
                            </div>
                            <div className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                              {scenario.setting}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Chat Bubbles */}
                      <div className="space-y-4 mb-6">
                        {date.messages.map((msg, i) => {
                          const isP1 = msg.sender === date.person1_id;
                          return (
                            <div
                              key={i}
                              className={`flex flex-col ${isP1 ? 'items-start chat-left' : 'items-end chat-right'}`}
                            >
                              <div className="flex items-center gap-2 mb-1 px-1">
                                <span className={`text-[11px] font-bold ${isP1 ? 'text-amber-400' : 'text-rose-400'}`}>
                                  {msg.senderName}
                                </span>
                                <span className="text-[10px] text-zinc-600 font-mono">Turn {i + 1}</span>
                              </div>
                              <div
                                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                                  isP1
                                    ? 'rounded-tl-xs border border-white/[0.08] bg-zinc-900 text-zinc-200'
                                    : 'rounded-tr-xs border border-rose-500/20 bg-gradient-to-r from-rose-950/40 to-pink-950/40 text-zinc-100'
                                }`}
                              >
                                {msg.content}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Analytical Highlights Callout */}
                      {date.highlights && (
                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
                          <span className="text-xl">✨</span>
                          <div>
                            <div className="text-[11px] uppercase tracking-wider font-bold text-amber-400 font-mono">
                              Observer AI Chemistry Analysis
                            </div>
                            <p className="mt-1 text-xs text-zinc-300 italic leading-relaxed">
                              &ldquo;{date.highlights}&rdquo;
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Quick Profile Nav */}
                      <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-500">
                        <Link href={`/profiles/${date.person1_id}`} className="hover:text-amber-400 transition-colors">
                          View {date.person1_name}&apos;s Dossier →
                        </Link>
                        <Link href={`/profiles/${date.person2_id}`} className="hover:text-rose-400 transition-colors">
                          View {date.person2_name}&apos;s Dossier →
                        </Link>
                      </div>
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
