import { getPersonById, getProfileByPersonId, getDatesByPersonId, getRankingsByPersonId } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface ProfileData {
  personality_type?: string;
  tagline?: string;
  summary?: string;
  traits?: string[];
  communication_style?: string;
  humor_type?: string;
  hobbies?: string[];
  passions?: string[];
  values?: string[];
  looking_for?: string;
  greenFlags?: string[];
  dealbreakers?: string[];
  icebreaker?: string;
  controversial_take?: string;
  ideal_date?: string;
}

interface PersonData {
  name: string;
  photo_url?: string | null;
  linkedin_url: string;
  instagram_url: string;
}

export default async function ProfilePage({ params }: PageProps) {
  const { id } = await params;
  const person = getPersonById(id) as unknown as PersonData | undefined;

  if (!person) {
    return (
      <div className="min-h-screen px-4 py-24 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center">
        <div className="h-16 w-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl mb-4 shadow-lg shadow-amber-500/10">
          🔍
        </div>
        <h1 className="text-2xl font-black text-white">Persona Session Cleared</h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-md leading-relaxed">
          This dynamically generated link was refreshed during our zero-downtime server redeploy. Explore all 29+ active agent dossiers below!
        </p>
        <Link
          href="/profiles"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 hover:scale-105 transition-all"
        >
          Explore All Active Profiles →
        </Link>
      </div>
    );
  }

  const profile = getProfileByPersonId(id) as unknown as ProfileData | null;
  const dates = getDatesByPersonId(id);
  const rankings = getRankingsByPersonId(id);

  const name = person.name;
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumb Back Link */}
        <Link
          href="/profiles"
          className="mb-8 inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-amber-400 transition-colors"
        >
          <span>←</span> Back to All Personas
        </Link>

        {/* Hero Banner */}
        <div className="mb-8 rounded-3xl border border-white/[0.08] bg-zinc-900/60 p-6 sm:p-8 backdrop-blur-xl">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-6">
            <div className="mb-4 flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500 via-rose-500 to-pink-600 text-3xl font-black text-white shadow-xl shadow-rose-500/10 ring-2 ring-white/10 overflow-hidden sm:mb-0">
              {person.photo_url ? (
                <img src={person.photo_url as string} alt={name} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-3xl font-black text-white tracking-tight">{name}</h1>
                {profile?.personality_type && (
                  <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                    {profile.personality_type as string}
                  </span>
                )}
              </div>

              {profile?.tagline && (
                <p className="mt-1 text-sm sm:text-base italic text-zinc-400">
                  &ldquo;{profile.tagline as string}&rdquo;
                </p>
              )}

              {/* Source Social Links */}
              <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <a
                  href={person.linkedin_url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 transition-all"
                >
                  <span className="font-bold">in</span> Public LinkedIn Profile
                </a>
                <a
                  href={person.instagram_url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-pink-500/30 bg-pink-500/10 px-3.5 py-1.5 text-xs font-semibold text-pink-300 hover:bg-pink-500/20 transition-all"
                >
                  <span className="font-bold">ig</span> Public Instagram Profile
                </a>
              </div>
            </div>
          </div>
        </div>

        {profile ? (
          <>
            {/* Executive Psychological Dossier */}
            {profile.summary && (
              <div className="mb-6 rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 backdrop-blur-xl">
                <div className="text-[11px] uppercase tracking-wider font-bold text-amber-400 mb-2 font-mono flex items-center gap-1.5">
                  <span>🧠</span> Executive Psychographic Dossier
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">{profile.summary as string}</p>
              </div>
            )}

            {/* Personality & Interests Grid */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              {/* Personality Dynamics */}
              <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 backdrop-blur-xl">
                <h2 className="mb-4 text-base font-bold text-white flex items-center gap-2">
                  <span>⚡</span> Behavioral Traits & Dynamics
                </h2>
                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">CORE TRAITS</span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {(profile.traits as string[])?.map((trait: string) => (
                        <span key={trait} className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">COMMUNICATION STYLE</span>
                    <p className="mt-1 text-xs text-zinc-300 leading-relaxed">{profile.communication_style as string}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">HUMOR ARCHETYPE</span>
                    <p className="mt-1 text-xs text-zinc-300 leading-relaxed">{profile.humor_type as string}</p>
                  </div>
                </div>
              </div>

              {/* Passions & Values */}
              <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 backdrop-blur-xl">
                <h2 className="mb-4 text-base font-bold text-white flex items-center gap-2">
                  <span>🎯</span> Passions & Core Values
                </h2>
                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">PASSIONS</span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {(profile.passions as string[])?.map((p: string) => (
                        <span key={p} className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-300">{p}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">HOBBIES</span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {(profile.hobbies as string[])?.map((h: string) => (
                        <span key={h} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">{h}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">NON-NEGOTIABLE VALUES</span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {(profile.values as string[])?.map((v: string) => (
                        <span key={v} className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-300">{v}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dating Preferences & Quotes */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              {/* Partner Dynamics */}
              <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 backdrop-blur-xl">
                <h2 className="mb-4 text-base font-bold text-white flex items-center gap-2">
                  <span>💕</span> Compatibility Filters
                </h2>
                <p className="mb-4 text-xs text-zinc-300 leading-relaxed">{profile.looking_for as string}</p>
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">✅ GREEN FLAGS</span>
                    <ul className="mt-1.5 space-y-1">
                      {(profile.greenFlags as string[])?.map((f: string) => (
                        <li key={f} className="text-xs text-zinc-400 flex items-start gap-1.5">
                          <span className="text-emerald-400">•</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-bold">🚩 DEALBREAKERS</span>
                    <ul className="mt-1.5 space-y-1">
                      {(profile.dealbreakers as string[])?.map((d: string) => (
                        <li key={d} className="text-xs text-zinc-400 flex items-start gap-1.5">
                          <span className="text-rose-400">•</span> {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* In-Character Dating Prompts */}
              <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 backdrop-blur-xl">
                <h2 className="mb-4 text-base font-bold text-white flex items-center gap-2">
                  <span>💬</span> In-Character Prompts
                </h2>
                <div className="space-y-3">
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">OPENING ICEBREAKER</span>
                    <p className="mt-1 text-xs italic text-zinc-200">&ldquo;{profile.icebreaker as string}&rdquo;</p>
                  </div>
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold">SPICY CONTROVERSIAL TAKE</span>
                    <p className="mt-1 text-xs italic text-zinc-200">&ldquo;{profile.controversial_take as string}&rdquo;</p>
                  </div>
                  <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-violet-400 font-bold">IDEAL DATE BLUEPRINT</span>
                    <p className="mt-1 text-xs text-zinc-200 leading-relaxed">{profile.ideal_date as string}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Matches Preview */}
            {rankings.length > 0 && (
              <div className="mb-6 rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>🏆</span> Top Compatible Partners ({rankings.length})
                  </h2>
                  <Link href="/rankings" className="text-xs font-semibold text-amber-400 hover:text-amber-300">
                    Inspect Leaderboard →
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {(rankings as any[]).slice(0, 5).map((r, i) => (
                    <div key={r.id as string} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-zinc-800/40 p-3 hover:border-zinc-700 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black shrink-0 ${
                          i === 0 ? 'bg-amber-400 text-black' :
                          i === 1 ? 'bg-zinc-300 text-black' :
                          i === 2 ? 'bg-orange-700 text-white' :
                          'bg-zinc-800 text-zinc-400'
                        }`}>
                          {r.rank as number}
                        </span>
                        <div className="min-w-0">
                          <div className="font-bold text-white text-sm truncate">{r.ranked_person_name as string}</div>
                          <div className="text-[11px] text-zinc-400 truncate">&ldquo;{r.headline as string}&rdquo;</div>
                        </div>
                      </div>

                      <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-300 shrink-0">
                        {Math.round(r.overall_score as number)}% Match
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Dates Preview */}
            {dates.length > 0 && (
              <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>💬</span> Recorded Speed Dates ({dates.length})
                  </h2>
                  <Link href="/dating" className="text-xs font-semibold text-rose-400 hover:text-rose-300">
                    Read All Transcripts →
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {(dates as any[]).slice(0, 3).map((d) => {
                    const scenario = (() => { try { return JSON.parse(d.scenario as string); } catch { return { emoji: '💬', title: 'Date' }; } })();
                    const partnerName = d.person1_id === id ? d.person2_name : d.person1_name;
                    return (
                      <div key={d.id as string} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-zinc-800/40 p-3 hover:border-zinc-700 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-2xl shrink-0">{scenario.emoji}</span>
                          <div className="min-w-0">
                            <div className="font-bold text-white text-sm truncate">
                              {scenario.title} with {partnerName as string}
                            </div>
                            {Boolean(d.highlights) && (
                              <div className="text-[11px] text-zinc-400 truncate italic">&ldquo;{d.highlights as string}&rdquo;</div>
                            )}
                          </div>
                        </div>

                        <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-300 shrink-0">
                          {Math.round(d.chemistry_score as number)}% Chem
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center text-zinc-500">
            Profile dossier being synthesized.
          </div>
        )}
      </div>
    </div>
  );
}
