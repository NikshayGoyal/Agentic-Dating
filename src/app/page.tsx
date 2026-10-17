'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PersonData {
  id: string;
  name: string;
  linkedin_url: string;
  instagram_url: string;
  photo_url: string | null;
  category: string | null;
  tagline?: string;
  personality_type?: string;
  traits?: string[];
  summary?: string;
}

export default function HomePage() {
  const [people, setPeople] = useState<PersonData[]>([]);
  const [stats, setStats] = useState({ people: 0, profiles: 0, dates: 0, rankings: 0 });
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [personName, setPersonName] = useState('');
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [message, setMessage] = useState('');
  const [loadingPeople, setLoadingPeople] = useState(true);

  useEffect(() => {
    fetchPeople();
  }, []);

  async function fetchPeople() {
    try {
      const res = await fetch('/api/people');
      const data = await res.json();
      setPeople(data.people || []);
      setStats(data.stats || { people: 0, profiles: 0, dates: 0, rankings: 0 });
    } catch (err) {
      console.error('Failed to fetch people:', err);
    } finally {
      setLoadingPeople(false);
    }
  }

  async function handleAddPerson(e: React.FormEvent) {
    e.preventDefault();
    if (!linkedinUrl || !instagramUrl) return;

    setLoading(true);
    setMessage('🔍 Scraping profiles & analyzing personality...');

    try {
      const res = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkedinUrl,
          instagramUrl,
          name: personName || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage(`✅ Added ${data.name} — "${data.profile?.personalityType}"`);
        setLinkedinUrl('');
        setInstagramUrl('');
        setPersonName('');
        fetchPeople();
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setMessage('❌ Failed to add person. Check console for details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSimulate() {
    if (people.length < 2) {
      setMessage('Need at least 2 people to start dating simulation!');
      return;
    }

    setSimulating(true);
    setMessage('💘 Running dating simulation... This may take a few minutes.');

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (data.success) {
        setMessage(`✅ ${data.message}`);
        fetchPeople();
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setMessage('❌ Simulation failed. Check console for details.');
      console.error(err);
    } finally {
      setSimulating(false);
    }
  }

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  const gradients = [
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-violet-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-blue-500 to-indigo-600',
    'from-fuchsia-500 to-pink-600',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-16 pt-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl" />
          <div className="absolute right-1/4 top-20 h-96 w-96 rounded-full bg-rose-500/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="gradient-text">AI Agents</span>{' '}
            <span className="text-white">That</span>
            <br />
            <span className="text-white">Date For You</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-400">
            Real people. Real profiles. AI agents that analyze personalities from LinkedIn & Instagram,
            go on dates on their behalf, and find the best matches.
          </p>

          {/* Stats */}
          <div className="mb-12 flex items-center justify-center gap-8">
            {[
              { label: 'People', value: stats.people, icon: '👥' },
              { label: 'Profiles', value: stats.profiles, icon: '📋' },
              { label: 'Dates', value: stats.dates, icon: '💬' },
              { label: 'Rankings', value: stats.rankings, icon: '🏆' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="text-center">
                <div className="text-2xl">{icon}</div>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add Person Form */}
      <section className="px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-semibold text-white">
              ✨ Add Someone New
            </h2>
            <form onSubmit={handleAddPerson} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-400">
                  Name (optional — auto-detected from profiles)
                </label>
                <input
                  type="text"
                  value={personName}
                  onChange={e => setPersonName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-400">
                    LinkedIn URL *
                  </label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={e => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    required
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-400">
                    Instagram URL *
                  </label>
                  <input
                    type="url"
                    value={instagramUrl}
                    onChange={e => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/username"
                    required
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !linkedinUrl || !instagramUrl}
                className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 font-semibold text-black transition hover:from-amber-400 hover:to-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? '⏳ Processing...' : '🔍 Scrape & Analyze'}
              </button>
            </form>

            {message && (
              <div className="mt-4 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm">
                {message}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Simulate Button */}
      {people.length >= 2 && (
        <section className="px-4 pb-8 text-center sm:px-6 lg:px-8">
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-rose-500/25 transition hover:from-rose-400 hover:to-pink-500 hover:shadow-rose-500/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {simulating ? (
              <>⏳ Agents are dating...</>
            ) : (
              <>💘 Start Dating Simulation</>
            )}
          </button>
          <p className="mt-2 text-sm text-gray-500">
            {people.length} people ready • Agents will date each other and generate rankings
          </p>
        </section>
      )}

      {/* People Grid */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-6 text-2xl font-bold text-white">
            {loadingPeople ? 'Loading...' : `${people.length} People`}
          </h2>

          {people.length === 0 && !loadingPeople ? (
            <div className="rounded-2xl border border-dashed border-gray-700 p-12 text-center">
              <p className="text-lg text-gray-500">
                No people added yet. Add someone above to get started!
              </p>
            </div>
          ) : (
            <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {people.map((person, i) => (
                <Link
                  key={person.id}
                  href={`/profiles/${person.id}`}
                  className="card-glow group rounded-xl border border-gray-800 bg-gray-900/50 p-5 backdrop-blur-sm transition"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${gradients[i % gradients.length]} text-sm font-bold text-white shadow-lg`}>
                      {person.photo_url ? (
                        <img src={person.photo_url} alt={person.name} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        getInitials(person.name)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-white group-hover:text-amber-400 transition">
                        {person.name}
                      </h3>
                      {person.personality_type && (
                        <span className="inline-block rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
                          {person.personality_type}
                        </span>
                      )}
                    </div>
                  </div>
                  {person.tagline && (
                    <p className="mb-2 text-sm text-gray-400 line-clamp-2">
                      {person.tagline}
                    </p>
                  )}
                  {person.traits && person.traits.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {person.traits.slice(0, 3).map((trait: string) => (
                        <span key={trait} className="rounded-md bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                          {trait}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
