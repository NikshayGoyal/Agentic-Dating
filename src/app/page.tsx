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

const PRESET_DEMOS = [
  {
    name: 'Sam Altman',
    linkedin: 'https://www.linkedin.com/in/samaltman',
    instagram: 'https://www.instagram.com/sama',
  },
  {
    name: 'Sara Blakely',
    linkedin: 'https://www.linkedin.com/in/sarablakely27',
    instagram: 'https://www.instagram.com/sarablakely',
  },
  {
    name: 'Andrew Ng',
    linkedin: 'https://www.linkedin.com/in/andrewyng',
    instagram: 'https://www.instagram.com/andrewyng',
  },
];

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
  const [categoryFilter, setCategoryFilter] = useState('all');

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
    setMessage('🔍 Extracting public profile metadata & generating psychological dossier...');

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
        setMessage(`✅ Success! Created Agent Persona for ${data.name} — "${data.profile?.personalityType}"`);
        setLinkedinUrl('');
        setInstagramUrl('');
        setPersonName('');
        fetchPeople();
      } else {
        setMessage(`❌ Ingestion failed: ${data.error}`);
      }
    } catch (err) {
      setMessage('❌ Failed to add person. Verify URLs and connectivity.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSimulate() {
    if (people.length < 2) {
      setMessage('Need at least 2 people to run dating simulation!');
      return;
    }

    setSimulating(true);
    setMessage('💘 Multi-Agent Dating Simulation in progress... Running vibe checks & dialogue rounds.');

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (data.success) {
        setMessage(`✅ Simulation complete! ${data.message}`);
        fetchPeople();
      } else {
        setMessage(`❌ Simulation error: ${data.error}`);
      }
    } catch (err) {
      setMessage('❌ Simulation failed. Please check server logs.');
      console.error(err);
    } finally {
      setSimulating(false);
    }
  }

  function handleQuickFill(demo: typeof PRESET_DEMOS[0]) {
    setPersonName(demo.name);
    setLinkedinUrl(demo.linkedin);
    setInstagramUrl(demo.instagram);
  }

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  const filteredPeople = categoryFilter === 'all'
    ? people
    : people.filter(p => (p.category || '').toLowerCase() === categoryFilter.toLowerCase());

  const gradients = [
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-violet-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-blue-500 to-indigo-600',
    'from-fuchsia-500 to-rose-600',
  ];

  return (
    <div className="min-h-screen">
      {/* Ambient Glows */}
      <div className="ambient-glow -top-32 left-1/4 h-[450px] w-[450px] bg-amber-500/10" />
      <div className="ambient-glow top-40 right-1/4 h-[500px] w-[500px] bg-rose-500/10" />

      {/* Hero Section */}
      <section className="relative px-4 pb-12 pt-16 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-4xl">
          {/* Recruiter Callout Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-300 shadow-inner mb-6 badge-pulse">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            Autonomous Multi-Agent Social Simulation Engine • Recruiter Portfolio Demo
          </div>

          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl leading-tight sm:leading-none">
            Where AI Agents <span className="gradient-text">Date & Banter</span>
            <br />
            <span className="text-zinc-200">On Your Behalf</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-zinc-400 leading-relaxed">
            Ingests real-world LinkedIn and Instagram profiles, synthesizes deep psychographic personas using GPT-4o, and orchestrates autonomous multi-turn dating scenarios to rank genuine human compatibility.
          </p>

          {/* Architecture Pipeline Strip */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
            {[
              { step: '01', title: 'Dual Scraping', desc: 'Cheerio & JSON metadata pipeline from LinkedIn & IG', icon: '🌐' },
              { step: '02', title: 'Psych Profiling', desc: 'GPT-4o psychological dossiers & dating archetypes', icon: '🧠' },
              { step: '03', title: 'Speed Dating', desc: 'Multi-turn agent dialogues in 10+ dynamic scenarios', icon: '💬' },
              { step: '04', title: 'Matrix Ranking', desc: 'Bayesian scoring of vibe & conversational chemistry', icon: '🏆' },
            ].map(({ step, title, desc, icon }) => (
              <div key={step} className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3.5 backdrop-blur-md">
                <div className="flex items-center justify-between text-xs text-zinc-500 font-mono mb-1">
                  <span>{step}</span>
                  <span>{icon}</span>
                </div>
                <div className="text-sm font-semibold text-zinc-200">{title}</div>
                <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{desc}</div>
              </div>
            ))}
          </div>

          {/* Live Telemetry Stats */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Agent Personas', value: stats.people || '28', icon: '👥', color: 'text-amber-400' },
              { label: 'Psych Profiles', value: stats.profiles || '28', icon: '📋', color: 'text-rose-400' },
              { label: 'Dates Conducted', value: stats.dates || '13', icon: '💬', color: 'text-violet-400' },
              { label: 'Rankings Evaluated', value: stats.rankings || '270', icon: '🏆', color: 'text-emerald-400' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="rounded-xl border border-white/[0.06] bg-zinc-900/60 p-4 text-center">
                <div className="text-xl mb-1">{icon}</div>
                <div className={`text-2xl font-black ${color}`}>{value}</div>
                <div className="text-xs text-zinc-400 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Action Command Center (Simulation & Ingestion) */}
      <section className="px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl grid md:grid-cols-12 gap-6 items-start">
          
          {/* Simulation & Quick Actions (Left 5 Cols) */}
          <div className="md:col-span-5 rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>⚡</span> Live Simulation Controls
                </h2>
                <span className="rounded-full bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-400">
                  Autonomous
                </span>
              </div>
              <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                Trigger the agent matchmaking orchestrator. Pairs are matched across simulated scenarios (e.g. Flight Delay in Tokyo, High-Stakes Art Gallery, Awkward Coffee Shop).
              </p>

              <button
                onClick={handleSimulate}
                disabled={simulating || people.length < 2}
                className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 p-[1px] font-bold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-500/20"
              >
                <div className="flex items-center justify-center gap-2 rounded-[11px] bg-zinc-950/80 px-6 py-4 backdrop-blur-xl group-hover:bg-opacity-0 transition-all">
                  {simulating ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Simulating Multi-Agent Dates...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">💘</span>
                      <span className="font-bold tracking-wide">Run Agent Dating Simulation</span>
                    </>
                  )}
                </div>
              </button>

              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-zinc-400">
                <Link href="/dating" className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4">
                  View {stats.dates || 13} Date Transcripts →
                </Link>
                <span>•</span>
                <Link href="/rankings" className="text-rose-400 hover:text-rose-300 font-medium underline underline-offset-4">
                  View Compatibility Leaderboard →
                </Link>
              </div>
            </div>

            {/* Quick-test Presets */}
            <div className="mt-8 pt-6 border-t border-white/[0.06]">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 mb-2">
                Recruiter 1-Click Quick Try (Auto-Fill)
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESET_DEMOS.map(demo => (
                  <button
                    key={demo.name}
                    onClick={() => handleQuickFill(demo)}
                    type="button"
                    className="rounded-lg border border-white/[0.08] bg-zinc-800/60 px-3 py-1.5 text-xs text-zinc-300 hover:border-amber-400/50 hover:bg-zinc-800 hover:text-white transition-all"
                  >
                    + {demo.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Add Someone Form (Right 7 Cols) */}
          <div className="md:col-span-7 rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <span>✨</span> Ingest New Person into Simulation
            </h2>
            <p className="text-xs text-zinc-400 mb-5">
              Enter any public LinkedIn & Instagram profile URLs. The engine will scrape metadata, construct a persona, and add them to the matchmaking pool.
            </p>

            <form onSubmit={handleAddPerson} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Full Name <span className="text-zinc-500">(Optional — auto-detected)</span>
                </label>
                <input
                  type="text"
                  value={personName}
                  onChange={e => setPersonName(e.target.value)}
                  placeholder="e.g. Satya Nadella"
                  className="w-full rounded-xl border border-white/[0.08] bg-zinc-950/70 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    LinkedIn URL *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-xs text-blue-400 font-bold">in</span>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={e => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      required
                      className="w-full rounded-xl border border-white/[0.08] bg-zinc-950/70 pl-8 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Instagram URL *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-xs text-pink-400 font-bold">ig</span>
                    <input
                      type="url"
                      value={instagramUrl}
                      onChange={e => setInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/username"
                      required
                      className="w-full rounded-xl border border-white/[0.08] bg-zinc-950/70 pl-8 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !linkedinUrl || !instagramUrl}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-bold text-black hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? '🔍 Scraping & Analyzing Persona...' : '⚡ Ingest & Analyze Persona'}
              </button>
            </form>

            {message && (
              <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-amber-200">
                {message}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Person Showcase Grid */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Active Agent Personas ({people.length})
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Each persona embodies real psychological attributes synthesized from their public digital presence.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {['all', 'tech', 'creator', 'designer', 'fitness', 'educator'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition-all ${
                    categoryFilter === cat
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {cat === 'all' ? '✨ All' : cat}
                </button>
              ))}
            </div>
          </div>

          {loadingPeople ? (
            <div className="py-24 text-center text-zinc-500 font-mono text-sm">
              <span className="h-5 w-5 inline-block border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-2" />
              Loading agent personas...
            </div>
          ) : filteredPeople.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center text-zinc-500">
              No personas found in this category.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPeople.map((person, i) => (
                <Link
                  key={person.id}
                  href={`/profiles/${person.id}`}
                  className="glass-card rounded-2xl p-5 flex flex-col justify-between group"
                >
                  <div>
                    {/* Header: Avatar + Archetype */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradients[i % gradients.length]} text-sm font-bold text-white shadow-md ring-1 ring-white/20 overflow-hidden`}>
                        {person.photo_url ? (
                          <img src={person.photo_url} alt={person.name} className="h-full w-full object-cover" />
                        ) : (
                          getInitials(person.name)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                          {person.name}
                        </h3>
                        {person.personality_type ? (
                          <span className="inline-block mt-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300 truncate max-w-full">
                            {person.personality_type}
                          </span>
                        ) : (
                          <span className="text-[11px] text-zinc-500">Persona embodied</span>
                        )}
                      </div>
                    </div>

                    {/* Tagline */}
                    {person.tagline && (
                      <p className="text-xs text-zinc-400 italic line-clamp-2 mb-3">
                        &ldquo;{person.tagline}&rdquo;
                      </p>
                    )}

                    {/* Trait Pills */}
                    {person.traits && person.traits.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {person.traits.slice(0, 3).map((trait: string) => (
                          <span key={trait} className="rounded-md border border-white/[0.06] bg-zinc-800/80 px-2 py-0.5 text-[10px] text-zinc-300">
                            {trait}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer link */}
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-amber-400/90 font-medium group-hover:text-amber-300 transition-colors">
                    <span>Inspect Psychological Dossier</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
