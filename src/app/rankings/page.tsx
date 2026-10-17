'use client';

import { useState, useEffect } from 'react';

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
        setRankings(data.rankings || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedPerson]);

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  function getRankStyle(rank: number) {
    if (rank === 1) return { bg: 'bg-amber-500', text: 'text-black', shadow: 'shadow-amber-500/30', label: '🥇' };
    if (rank === 2) return { bg: 'bg-gray-300', text: 'text-black', shadow: 'shadow-gray-300/30', label: '🥈' };
    if (rank === 3) return { bg: 'bg-orange-700', text: 'text-white', shadow: 'shadow-orange-700/30', label: '🥉' };
    return { bg: 'bg-gray-700', text: 'text-gray-300', shadow: '', label: `#${rank}` };
  }

  const selectedPersonName = people.find(p => p.id === selectedPerson)?.name || '';

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">🏆 Rankings</h1>
          <p className="mt-2 text-gray-400">
            Who fits each person best — ranked by AI dating agents
          </p>
        </div>

        {/* Person Selector */}
        <div className="mb-8">
          <label className="mb-2 block text-sm font-medium text-gray-400">
            Select a person to see their matches:
          </label>
          <div className="flex flex-wrap gap-2">
            {people.map(person => (
              <button
                key={person.id}
                onClick={() => setSelectedPerson(person.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedPerson === person.id
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="h-5 w-5 rounded-full bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-[8px] font-bold text-white">
                  {getInitials(person.name)}
                </span>
                {person.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Rankings List */}
        {selectedPerson && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white mb-1">
              Best matches for {selectedPersonName}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {rankings.length} matches ranked by compatibility
            </p>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-gray-500">Loading rankings...</div>
        ) : rankings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-700 p-12 text-center">
            <p className="text-lg text-gray-500">
              No rankings yet. Run the dating simulation first!
            </p>
          </div>
        ) : (
          <div className="space-y-3 stagger-children">
            {rankings.map((ranking) => {
              const isExpanded = expandedId === ranking.id;
              const rankStyle = getRankStyle(ranking.rank);

              return (
                <div
                  key={ranking.id}
                  className={`rounded-2xl border bg-gray-900/50 overflow-hidden transition-all ${
                    ranking.rank <= 3 ? 'border-amber-500/30' : 'border-gray-800'
                  }`}
                >
                  {/* Header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : ranking.id)}
                    className="flex w-full items-center gap-4 p-5 text-left hover:bg-gray-800/30 transition"
                  >
                    {/* Rank Badge */}
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${rankStyle.bg} ${rankStyle.text} ${rankStyle.shadow} text-sm font-bold shadow-lg`}>
                      {ranking.rank}
                    </div>

                    {/* Person Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white">
                        {ranking.ranked_person_name}
                      </div>
                      <div className="text-sm text-amber-400/70">
                        {ranking.headline}
                      </div>
                      {ranking.ranked_person_personality && (
                        <span className="text-xs text-gray-500">
                          {ranking.ranked_person_personality}
                        </span>
                      )}
                    </div>

                    {/* Score */}
                    <div className={`text-center ${ranking.rank === 1 ? 'pulse-score' : ''}`}>
                      <div className={`rounded-full px-4 py-1.5 text-lg font-bold ${
                        ranking.overall_score >= 75 ? 'bg-emerald-500/20 text-emerald-400' :
                        ranking.overall_score >= 50 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {Math.round(ranking.overall_score)}%
                      </div>
                    </div>

                    <svg
                      className={`h-5 w-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded Report */}
                  {isExpanded && (
                    <div className="border-t border-gray-800 p-5 space-y-4">
                      {/* Summary */}
                      <p className="text-gray-300 leading-relaxed">{ranking.summary}</p>

                      <div className="grid gap-4 sm:grid-cols-3">
                        {/* Shared Interests */}
                        <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4">
                          <div className="text-xs font-medium text-emerald-500 mb-2">🤝 SHARED INTERESTS</div>
                          <ul className="space-y-1">
                            {ranking.sharedInterests.map((interest, i) => (
                              <li key={i} className="text-sm text-gray-400">• {interest}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Complementary */}
                        <div className="rounded-xl bg-blue-500/5 border border-blue-500/20 p-4">
                          <div className="text-xs font-medium text-blue-500 mb-2">⚖️ COMPLEMENTARY</div>
                          <ul className="space-y-1">
                            {ranking.complementaryTraits.map((trait, i) => (
                              <li key={i} className="text-sm text-gray-400">• {trait}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Potential Friction */}
                        <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-4">
                          <div className="text-xs font-medium text-red-500 mb-2">⚡ WATCH OUT</div>
                          <ul className="space-y-1">
                            {ranking.potentialFriction.map((friction, i) => (
                              <li key={i} className="text-sm text-gray-400">• {friction}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Best Date Idea */}
                      <div className="rounded-xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-500/20 p-4">
                        <div className="text-xs font-medium text-amber-500 mb-1">💡 BEST DATE IDEA</div>
                        <p className="text-sm text-gray-300">{ranking.best_date_idea}</p>
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
