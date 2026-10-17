import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AgentMatch — AI Agents That Date For You",
  description: "An agentic dating platform where AI agents analyze real people from LinkedIn & Instagram, go on dates on their behalf, and rank compatibility.",
};

function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800/50 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <span className="text-2xl">💘</span>
            <span className="gradient-text">AgentMatch</span>
          </Link>
          <div className="flex items-center gap-1">
            {[
              { href: '/', label: 'Home', icon: '🏠' },
              { href: '/profiles', label: 'Profiles', icon: '👤' },
              { href: '/dating', label: 'Dating', icon: '💬' },
              { href: '/rankings', label: 'Rankings', icon: '🏆' },
            ].map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-all hover:bg-gray-800/50 hover:text-white"
              >
                <span>{icon}</span>
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0a] text-gray-100 antialiased">
        <NavBar />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
