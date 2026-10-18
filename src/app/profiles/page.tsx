'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PersonData {
  id: string;
  name: string;
  photo_url: string | null;
  category: string | null;
  tagline?: string;
  personality_type?: string;
  traits?: string[];
  hobbies?: string[];
  summary?: string;
}

export default function ProfilesPage() {
  const [people, setPeople] = useState<PersonData[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/people')
      .then(res => res.json())
      .then(data => {
        setPeople(data.people || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = people.filter(p => {
    const matchesCat = filter === 'all' || (p.category || '').toLowerCase() === filter.toLowerCase();
    const matchesSearch = !search || 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      (p.personality_type || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.tagline || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.traits || []).some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'All Personas' },
    { id: 'tech', label: 'Tech Founders 💻' },
    { id: 'creator', label: 'Content Creators 🎨' },
    { id: 'designer', label: 'Designers ✒️' },
    { id: 'fitness', label: 'Fitness & Lifestyle ⚡' },
    { id: 'educator', label: 'Thought Leaders 📚' },
  ];

  const gradients = [
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-violet-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-blue-500 to-indigo-600',
    'from-fuchsia-500 to-pink-600',
  ];

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 mb-3">
            <span>👤</span> Digital Footprint Profiling Pipeline
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Psychographic Agent Roster
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {people.length} real personalities curated from LinkedIn and Instagram, ready for autonomous matchmaking.
          </p>
        </div>

        {/* Controls: Search + Categories */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  filter === cat.id
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-bold'
                    : 'bg-zinc-900 border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, archetype, trait..."
              className="w-full rounded-xl border border-white/[0.08] bg-zinc-900/80 pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="py-24 text-center text-zinc-500 font-mono text-sm">
            <span className="h-5 w-5 inline-block border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-2" />
            Loading dossiers...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center text-zinc-500">
            No agent profiles match your current search or category filter.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((person, i) => (
              <Link
                key={person.id}
                href={`/profiles/${person.id}`}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between group"
              >
                <div>
                  <div className="mb-4 flex items-start gap-4">
                    <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradients[i % gradients.length]} text-lg font-bold text-white shadow-lg ring-1 ring-white/20 overflow-hidden`}>
                      {person.photo_url ? (
                        <img src={person.photo_url} alt={person.name} className="h-full w-full object-cover" />
                      ) : (
                        getInitials(person.name)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                        {person.name}
                      </h3>
                      {person.personality_type && (
                        <span className="inline-block mt-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-300 truncate max-w-full">
                          {person.personality_type}
                        </span>
                      )}
                    </div>
                  </div>

                  {person.tagline && (
                    <p className="mb-3 text-xs italic text-zinc-400 line-clamp-2">
                      &ldquo;{person.tagline}&rdquo;
                    </p>
                  )}

                  {person.summary && (
                    <p className="mb-4 text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                      {person.summary}
                    </p>
                  )}

                  {person.traits && person.traits.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {person.traits.slice(0, 4).map((trait: string) => (
                        <span key={trait} className="rounded-md border border-white/[0.06] bg-zinc-800/80 px-2.5 py-1 text-[11px] text-zinc-300 font-medium">
                          {trait}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-amber-400/90 group-hover:text-amber-300 transition-colors">
                  <span>Inspect Psychological Profile</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
