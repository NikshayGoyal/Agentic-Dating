# 💘 AgentMatch — Agentic Dating Platform

> An autonomous dating ecosystem where AI agents represent real people, analyze personalities from LinkedIn & public Instagram profiles, go on scenario-based dates on their behalf, and rank mutual compatibility.

---

## 🌟 The Core Concept

In traditional dating apps, humans waste hours swiping on superficial bios. **AgentMatch** introduces a paradigm shift:
1. **You provide two public profiles:** LinkedIn + Instagram.
2. **Your Agent analyzes you:** Ingests professional trajectory, personal passions, communication cadence, and sense of humor.
3. **Agents date on your behalf:** Each person's autonomous agent goes on simulated speed-dates across dynamic real-world scenarios.
4. **Compatibility Rankings:** Agents evaluate mutual chemistry, potential friction, shared passions, and rank who fits each person best.

---

## 🏗️ Architecture & Technical Stack

```
   [LinkedIn Public Profile]     +     [Instagram Public Profile]
                  │                                │
                  └───────────────┬────────────────┘
                                  ▼
                    [Tiered Scraping Pipeline]
                 (Cheerio · LD+JSON · Web Graph)
                                  │
                                  ▼
                    [AI Profile Analyzer Agent]
               (Archetype · Traits · Values · Hot Takes)
                                  │
                                  ▼
                   [Autonomous Dating Harness]
         (Themed Scenarios: Coffee, Late-Night, Art Gallery)
                                  │
                                  ▼
                   [Chemistry & Ranking Engine]
       (Compatibility Reports · Friction Points · Date Ideas)
                                  │
                                  ▼
               [Interactive Next.js 16 Web Interface]
```

- **Frontend & App Framework:** Next.js 16 (App Router, TypeScript, Tailwind CSS, Turbopack)
- **Scraping Engine:** Multi-tiered HTTP scraper with Cheerio, parsing `application/ld+json`, OpenGraph metadata, and structured DOM profiles
- **Agent Intelligence:** OpenAI GPT-4o & GPT-4o-mini agent harness with character-embodied system prompts and structured outputs
- **Storage Layer:** High-performance SQLite (`better-sqlite3` with WAL mode)
- **Deployment:** Docker container ready for Railway, Render, Fly.io, or VPS

---

## ⚡ Key Features

- **27 Pre-loaded Real Profiles:** Including Gary Vaynerchuk, Sara Blakely, Tim Ferriss, Ali Abdaal, Brene Brown, Simon Sinek, Casey Neistat, Chris Do, and more.
- **Deep Personality Profiles:** Not generic tags—analyzed archetypes like *"The Relentless Hustler"*, *"The Experimental Stoic"*, *"The Brave Truth-Teller"*, complete with icebreakers and dealbreakers.
- **Live Dating Dialogue:** Watch agents converse in character with chat bubbles, scenario contexts, and post-date chemistry analysis.
- **Explainable Rankings:** Click any person to see their top matches with narrative summaries, shared interests, complementary traits, and personalized date recommendations.
- **Interactive Live Ingestion:** Anyone can paste their own LinkedIn and Instagram URLs to analyze their profile and date against the existing pool.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ or 24+
- npm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/agentic-dating.git
cd agentic-dating

# Install dependencies
npm install

# Run database seed (pre-populates 27 real people, dates, and rankings)
npx tsx scripts/seed-complete.ts

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

### Docker Deployment

```bash
docker build -t agentic-dating .
docker run -p 3000:3000 agentic-dating
```

---

## 📄 Form Submission Deliverables

- **Overall Explanation (200 chars max):**
  > AI agents analyze real LinkedIn+Instagram profiles, develop rich personalities, go on scenario-based speed dates in character, and rank compatibility — all live, with 25+ real people pre-loaded.

- **Technical Section (500 chars max):**
  > LinkedIn scraped via HTTP+Cheerio parsing ld+json structured schemas and OpenGraph metadata from public profiles, with Google Cache fallback. Instagram scraped via HTTP parsing embedded JSON and profile metadata. Raw profiles analyzed by GPT-4o into rich archetypes, values, and dealbreakers. Dating agents run on GPT-4o-mini across multi-turn themed scenarios with chemistry scoring. Built on Next.js 16 (TypeScript), Tailwind CSS, better-sqlite3 with WAL mode, containerized via Docker.
