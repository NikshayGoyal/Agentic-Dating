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
    notFound();
  }

  const profile = getProfileByPersonId(id) as unknown as ProfileData | null;
  const dates = getDatesByPersonId(id);
  const rankings = getRankingsByPersonId(id);

  const name = person.name;
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Back link */}
        <Link href="/profiles" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-amber-400 transition">
          ← Back to profiles
        </Link>

        {/* Hero */}
        <div className="mb-8 flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-6">
          <div className="mb-4 flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500 to-rose-600 text-3xl font-bold text-white shadow-2xl shadow-amber-500/20 sm:mb-0">
            {person.photo_url ? (
              <img src={person.photo_url as string} alt={name} className="h-full w-full rounded-3xl object-cover" />
            ) : (
              initials
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{name}</h1>
            {profile?.personality_type && (
              <span className="mt-2 inline-block rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-400">
                {profile.personality_type as string}
              </span>
            )}
            {profile?.tagline && (
              <p className="mt-2 text-lg italic text-gray-400">
                &ldquo;{profile.tagline as string}&rdquo;
              </p>
            )}
            <div className="mt-3 flex items-center justify-center gap-3 sm:justify-start">
              <a href={person.linkedin_url as string} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-blue-900/30 px-3 py-1.5 text-xs font-medium text-blue-400 hover:bg-blue-900/50 transition">
                🔗 LinkedIn
              </a>
              <a href={person.instagram_url as string} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-pink-900/30 px-3 py-1.5 text-xs font-medium text-pink-400 hover:bg-pink-900/50 transition">
                📸 Instagram
              </a>
            </div>
          </div>
        </div>

        {profile ? (
          <>
            {/* Summary */}
            {profile.summary && (
              <div className="mb-6 rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
                <p className="text-gray-300 leading-relaxed">{profile.summary as string}</p>
              </div>
            )}

            {/* Personality & Interests Grid */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              {/* Personality */}
              <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">🧠 Personality</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-medium text-gray-500">TRAITS</span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {(profile.traits as string[])?.map((trait: string) => (
                        <span key={trait} className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500">COMMUNICATION</span>
                    <p className="mt-1 text-sm text-gray-300">{profile.communication_style as string}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500">HUMOR</span>
                    <p className="mt-1 text-sm text-gray-300">{profile.humor_type as string}</p>
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">✨ Interests</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-medium text-gray-500">HOBBIES</span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {(profile.hobbies as string[])?.map((h: string) => (
                        <span key={h} className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">{h}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500">PASSIONS</span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {(profile.passions as string[])?.map((p: string) => (
                        <span key={p} className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-medium text-rose-400">{p}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500">VALUES</span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {(profile.values as string[])?.map((v: string) => (
                        <span key={v} className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">{v}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dating Profile */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              {/* What they're looking for */}
              <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">💕 Looking For</h2>
                <p className="mb-4 text-sm text-gray-300">{profile.looking_for as string}</p>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-medium text-emerald-500">✅ GREEN FLAGS</span>
                    <ul className="mt-1 space-y-1">
                      {(profile.greenFlags as string[])?.map((f: string) => (
                        <li key={f} className="text-sm text-gray-400">• {f}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-red-500">🚩 DEALBREAKERS</span>
                    <ul className="mt-1 space-y-1">
                      {(profile.dealbreakers as string[])?.map((d: string) => (
                        <li key={d} className="text-sm text-gray-400">• {d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* On a Date */}
              <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">🎯 On a Date</h2>
                <div className="space-y-4">
                  <div className="rounded-xl bg-gray-800/50 p-4">
                    <span className="text-xs font-medium text-amber-500">💬 THEIR ICEBREAKER</span>
                    <p className="mt-1 text-sm italic text-gray-300">&ldquo;{profile.icebreaker as string}&rdquo;</p>
                  </div>
                  <div className="rounded-xl bg-gray-800/50 p-4">
                    <span className="text-xs font-medium text-rose-500">🔥 HOT TAKE</span>
                    <p className="mt-1 text-sm italic text-gray-300">&ldquo;{profile.controversial_take as string}&rdquo;</p>
                  </div>
                  <div className="rounded-xl bg-gray-800/50 p-4">
                    <span className="text-xs font-medium text-violet-500">🌟 IDEAL DATE</span>
                    <p className="mt-1 text-sm text-gray-300">{profile.ideal_date as string}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rankings preview */}
            {rankings.length > 0 && (
              <div className="mb-6 rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">🏆 Top Matches</h2>
                <div className="space-y-3">
                  {(rankings as Array<Record<string, unknown>>).slice(0, 5).map((r, i) => (
                    <div key={r.id as string} className="flex items-center gap-3 rounded-xl bg-gray-800/50 p-3">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        i === 0 ? 'bg-amber-500 text-black' :
                        i === 1 ? 'bg-gray-300 text-black' :
                        i === 2 ? 'bg-orange-700 text-white' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {r.rank as number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">{r.ranked_person_name as string}</div>
                        <div className="text-xs text-gray-500">{r.headline as string}</div>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        (r.overall_score as number) >= 75 ? 'bg-emerald-500/20 text-emerald-400' :
                        (r.overall_score as number) >= 50 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {Math.round(r.overall_score as number)}%
                      </span>
                    </div>
                  ))}
                </div>
                <Link href="/rankings" className="mt-4 inline-block text-sm text-amber-500 hover:text-amber-400 transition">
                  View all rankings →
                </Link>
              </div>
            )}

            {/* Recent Dates */}
            {dates.length > 0 && (
              <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">💬 Recent Dates</h2>
                <div className="space-y-3">
                  {(dates as Array<Record<string, unknown>>).slice(0, 3).map((d) => {
                    const scenario = (() => { try { return JSON.parse(d.scenario as string); } catch { return { emoji: '💬', title: 'Date' }; } })();
                    const partnerName = d.person1_id === id ? d.person2_name : d.person1_name;
                    return (
                      <div key={d.id as string} className="flex items-center gap-3 rounded-xl bg-gray-800/50 p-3">
                        <span className="text-2xl">{scenario.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate">
                            {scenario.title} with {partnerName as string}
                          </div>
                          {Boolean(d.highlights) && (
                            <div className="text-xs text-gray-500 truncate">{d.highlights as string}</div>
                          )}
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          (d.chemistry_score as number) >= 75 ? 'bg-emerald-500/20 text-emerald-400' :
                          (d.chemistry_score as number) >= 50 ? 'bg-amber-500/20 text-amber-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {Math.round(d.chemistry_score as number)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
                <Link href="/dating" className="mt-4 inline-block text-sm text-amber-500 hover:text-amber-400 transition">
                  View all dates →
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-700 p-12 text-center">
            <p className="text-lg text-gray-500">
              Profile analysis not yet available. Run the pipeline first.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
