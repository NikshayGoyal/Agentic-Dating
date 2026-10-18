import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AgentMatch — Autonomous Multi-Agent Social & Dating Simulation",
  description: "An agentic dating platform where AI agents analyze real people from LinkedIn & Instagram, embody their personalities, go on dates on their behalf, and rank compatibility.",
};

function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-[#060608]/85 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo & Recruiter Tag */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-lg shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
                💘
              </span>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-white group-hover:text-amber-300 transition-colors">
                  Agent<span className="gradient-text">Match</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest font-semibold text-amber-400/80 -mt-1 hidden sm:inline">
                  Multi-Agent Engine
                </span>
              </div>
            </Link>

            <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              28 Autonomous Agents Active
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              { href: '/', label: 'Overview', icon: '⚡' },
              { href: '/profiles', label: 'Profiles', icon: '👤' },
              { href: '/dating', label: 'Agent Dates', icon: '💬' },
              { href: '/rankings', label: 'Rankings', icon: '🏆' },
            ].map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-400 transition-all hover:bg-white/[0.06] hover:text-white"
              >
                <span>{icon}</span>
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}

            {/* GitHub Project Link */}
            <a
              href="https://github.com/NikshayGoyal/Agentic-Dating"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-gradient-to-r from-amber-500/10 to-rose-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:border-amber-400 hover:bg-amber-500/20 transition-all shadow-sm"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#060608] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div>
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-xl">💘</span>
            <span className="font-bold text-white tracking-tight">AgentMatch</span>
            <span className="text-xs text-zinc-500 font-mono">v1.0</span>
          </div>
          <p className="mt-1 text-xs text-zinc-400 max-w-md">
            Autonomous multi-agent simulation framework evaluating persona compatibility via dual-tier web scraping, LLM psychographic profiling, and multi-turn conversational dating rounds.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="rounded-md border border-white/[0.08] bg-zinc-900/80 px-2.5 py-1 font-mono text-zinc-300">Next.js 16</span>
          <span className="rounded-md border border-white/[0.08] bg-zinc-900/80 px-2.5 py-1 font-mono text-zinc-300">TypeScript</span>
          <span className="rounded-md border border-white/[0.08] bg-zinc-900/80 px-2.5 py-1 font-mono text-zinc-300">Better-SQLite3 (WAL)</span>
          <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 font-mono text-amber-300">OpenAI GPT-4o</span>
          <span className="rounded-md border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 font-mono text-rose-300">Cheerio Engine</span>
        </div>

        <div className="text-xs text-zinc-500">
          Portfolio Project by <span className="text-zinc-300 font-semibold">Nikshay Goyal</span> • IIT Graduate
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#060608] text-zinc-100 antialiased selection:bg-amber-500 selection:text-black">
        <NavBar />
        <main className="pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
