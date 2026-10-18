'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PersonOption {
  id: string;
  name: string;
  personality_type?: string;
  photo_url?: string;
}

interface RankingEntry {
  id: string;
  person_id: string;
  ranked_person_id: string;
  ranked_person_name: string;
  ranked_person_photo: string | null;
  ranked_person_personality: string | null;
  ranked_person_tagline: string | null;
  rank: number;
  overall_score: number;
  headline: string;
  summary: string;
  sharedInterests: string[];
  complementaryTraits: string[];
  potentialFriction: string[];
  best_date_idea: string;
}

export default function RankingsPage() {
  const [people, setPeople] = useState<PersonOption[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<string>('');
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/people')
      .then(res => res.json())
      .then(data => {
        const p = (data.people || []).map((person: Record<string, unknown>) => ({
          id: person.id,
          name: person.name,
          personality_type: person.personality_type,
          photo_url: person.photo_url,
        }));
        setPeople(p);
        if (p.length > 0) {
          setSelectedPerson(p[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedPerson) return;
    setLoading(true);
    fetch(`/api/rankings?personId=${selectedPerson}`)
      .then(res => res.json())
      .then(data => {
        const r = data.rankings || [];
        setRankings(r);
        if (r.length > 0) {
          // Auto-expand #1 match for immediate delight
          setExpandedId(r[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedPerson]);

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  function getRankBadge(rank: number) {
    if (rank === 1) return { bg: 'bg-gradient-to-br from-amber-400 to-yellow-600 text-black shadow-amber-500/30', label: '1', medal: '🥇' };
    if (rank === 2) return { bg: 'bg-gradient-to-br from-zinc-200 to-zinc-400 text-black shadow-zinc-400/20', label: '2', medal: '🥈' };
    if (rank === 3) return { bg: 'bg-gradient-to-br from-amber-700 to-orange-800 text-white shadow-orange-700/20', label: '3', medal: '🥉' };
    return { bg: 'bg-zinc-800 border border-white/[0.08] text-zinc-400', label: `#${rank}`, medal: '' };
  }

  const activePerson = people.find(p => p.id === selectedPerson);

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 mb-3">
            <span>🏆</span> Multi-Factor Compatibility Scoring Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Agent Compatibility Leaderboard
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Scores synthesized from 30% psychographic archetype alignment + 70% conversational chemistry recorded during multi-turn simulation rounds.
          </p>
        </div>

        {/* Persona Selector Ribbon */}
        <div className="mb-8 rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Select Candidate To Inspect Match Matrix
            </label>
            <span className="text-[11px] text-amber-400 font-mono">
              {people.length} Personas Available
            </span>
          </div>

          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
            {people.map(person => {
              const isSelected = selectedPerson === person.id;
              return (
                <button
                  key={person.id}
                  onClick={() => setSelectedPerson(person.id)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                    isSelected
                      ? 'border border-amber-400 bg-amber-500/20 text-white shadow-md shadow-amber-500/10 font-bold'
                      : 'border border-white/[0.06] bg-zinc-800/60 text-zinc-400 hover:border-zinc-600 hover:text-white'
                  }`}
                >
                  <span className="flex h-5 w-5 rounded-full bg-gradient-to-br from-amber-500 to-rose-500 items-center justify-center text-[9px] font-bold text-white shrink-0">
                    {getInitials(person.name)}
                  </span>
                  <span>{person.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Person Match Results */}
        {activePerson && (
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                Ranked Matches for <span className="text-amber-400">{activePerson.name}</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Evaluated against all other agents across scenario simulations
              </p>
            </div>
            <Link
              href={`/profiles/${activePerson.id}`}
              className="rounded-lg border border-white/[0.08] bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors"
            >
              View Full Profile →
            </Link>
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center text-zinc-500 font-mono text-sm">
            <span className="h-5 w-5 inline-block border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-2" />
            Computing compatibility rankings...
          </div>
        ) : rankings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center text-zinc-500">
            No rankings found. Run the simulation to compute matches!
          </div>
        ) : (
          <div className="space-y-4">
            {rankings.map((ranking) => {
              const isExpanded = expandedId === ranking.id;
              const badge = getRankBadge(ranking.rank);
              const isTop = ranking.rank === 1;

              return (
                <div
                  key={ranking.id}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isTop
                      ? 'border-amber-400/50 bg-gradient-to-b from-amber-950/20 via-zinc-900/80 to-zinc-900/80 shadow-xl shadow-amber-500/10'
                      : isExpanded
                      ? 'border-zinc-700 bg-zinc-900/80'
                      : 'border-white/[0.08] bg-zinc-900/40 hover:border-zinc-700'
                  }`}
                >
                  {/* Collapsible Header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : ranking.id)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Rank Medal / Badge */}
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${badge.bg} text-sm font-black shadow-md`}>
                        {badge.medal || badge.label}
                      </div>

                      {/* Ranked Match Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base truncate">
                            {ranking.ranked_person_name}
                          </span>
                          {isTop && (
                            <span className="hidden sm:inline-block rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                              Top Match
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-amber-400/90 mt-0.5 truncate">
                          &ldquo;{ranking.headline}&rdquo;
                        </div>
                        {ranking.ranked_person_personality && (
                          <div className="text-[11px] text-zinc-500 mt-0.5">
                            Archetype: {ranking.ranked_person_personality}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Overall Compatibility Meter */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-lg sm:text-xl font-black text-white leading-none">
                          {Math.round(ranking.overall_score)}%
                        </div>
                        <div className="text-[9px] uppercase tracking-wider text-zinc-500 mt-1 font-mono">
                          Match Score
                        </div>
                      </div>

                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800/80 text-zinc-400 transition-transform ${isExpanded ? 'rotate-180 text-white' : ''}`}>
                        ▼
                      </div>
                    </div>
                  </button>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <div className="border-t border-white/[0.08] p-5 sm:p-6 bg-zinc-950/70 space-y-5">
                      {/* Compatibility Summary */}
                      <div>
                        <div className="text-[11px] uppercase tracking-wider font-bold text-zinc-400 mb-1 font-mono">
                          Psychological Compatibility Analysis
                        </div>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                          {ranking.summary}
                        </p>
                      </div>

                      {/* 3-Column Diagnostic Matrix */}
                      <div className="grid gap-3 sm:grid-cols-3 text-xs">
                        {/* Shared Interests */}
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                          <div className="font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-[11px]">
                            <span>🤝</span> Shared Passions
                          </div>
                          <ul className="space-y-1.5 text-zinc-300">
                            {ranking.sharedInterests.map((interest, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-emerald-500 mt-0.5">•</span>
                                <span>{interest}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Complementary Traits */}
                        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                          <div className="font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-[11px]">
                            <span>⚖️</span> Synergistic Traits
                          </div>
                          <ul className="space-y-1.5 text-zinc-300">
                            {ranking.complementaryTraits.map((trait, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-blue-400 mt-0.5">•</span>
                                <span>{trait}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Potential Friction */}
                        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                          <div className="font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-[11px]">
                            <span>⚡</span> Potential Friction
                          </div>
                          <ul className="space-y-1.5 text-zinc-300">
                            {ranking.potentialFriction.map((f, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-rose-400 mt-0.5">•</span>
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Recommended Date Plan */}
                      <div className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-rose-500/10 p-4">
                        <div className="text-[11px] uppercase tracking-wider font-bold text-amber-400 font-mono mb-1 flex items-center gap-1.5">
                          <span>💡</span> Agent-Recommended Date Blueprint
                        </div>
                        <p className="text-xs text-zinc-200 leading-relaxed">
                          {ranking.best_date_idea}
                        </p>
                      </div>

                      {/* Direct Dossier Link */}
                      <div className="pt-2 flex justify-end">
                        <Link
                          href={`/profiles/${ranking.ranked_person_id}`}
                          className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                        >
                          View {ranking.ranked_person_name}&apos;s Profile Dossier →
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
