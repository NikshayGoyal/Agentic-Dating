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

  const filtered = filter === 'all'
    ? people
    : people.filter(p => p.category === filter);

  const categories = ['all', 'tech', 'creator', 'designer', 'fitness', 'educator'];

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
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            👤 All Profiles
          </h1>
          <p className="mt-2 text-gray-400">
            {people.length} people analyzed by AI agents
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filter === cat
                  ? 'bg-amber-500 text-black'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {cat === 'all' ? '🌐 All' : `${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-500">Loading profiles...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-700 p-12 text-center">
            <p className="text-lg text-gray-500">No profiles found.</p>
          </div>
        ) : (
          <div className="stagger-children grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((person, i) => (
              <Link
                key={person.id}
                href={`/profiles/${person.id}`}
                className="card-glow group rounded-2xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm transition"
              >
                <div className="mb-4 flex items-start gap-4">
                  <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradients[i % gradients.length]} text-lg font-bold text-white shadow-lg`}>
                    {person.photo_url ? (
                      <img src={person.photo_url} alt={person.name} className="h-full w-full rounded-2xl object-cover" />
                    ) : (
                      getInitials(person.name)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition">
                      {person.name}
                    </h3>
                    {person.personality_type && (
                      <span className="inline-block rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                        {person.personality_type}
                      </span>
                    )}
                  </div>
                </div>

                {person.tagline && (
                  <p className="mb-3 text-sm italic text-gray-400">
                    &ldquo;{person.tagline}&rdquo;
                  </p>
                )}

                {person.summary && (
                  <p className="mb-3 text-sm text-gray-500 line-clamp-3">
                    {person.summary}
                  </p>
                )}

                {person.traits && person.traits.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {person.traits.slice(0, 4).map((trait: string) => (
                      <span key={trait} className="rounded-md bg-gray-800 px-2 py-1 text-xs text-gray-400">
                        {trait}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 text-xs font-medium text-amber-500/70 group-hover:text-amber-400 transition">
                  View full profile →
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
