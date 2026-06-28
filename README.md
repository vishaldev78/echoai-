# ECHO AI — A Digital Memory Layer for Humanity

Preserve a person's knowledge, reasoning and experience beyond their lifespan. Upload their writings (PDF/notes/markdown), let AI weave a knowledge graph + timeline + thinking-style fingerprint, then converse with the preserved intelligence in their own voice.

> "Books preserved what humans knew. ECHO preserves how humans thought."

---

## Run locally in VS Code

### Prerequisites
- **Node.js 18+** (tested on Node 24) — [download](https://nodejs.org/)
- **npm** (comes with Node.js) — or use `bun` / `pnpm` / `yarn` if you prefer

### 1. Install dependencies
```bash
npm install
```
This also auto-generates the Prisma client (via the `postinstall` hook).

### 2. Set up the database
The app uses **Neon PostgreSQL** (serverless Postgres). Create a `.env` file in the project root:
```bash
# .env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```
Then push the schema to create all tables:
```bash
npm run db:push
```

> **Free database:** Create a free Neon project at [neon.tech](https://neon.tech), copy its connection string into `.env`.

### 3. Start the dev server
```bash
npm run dev
```
Open **http://localhost:3000** in your browser.

> **No API keys needed!** The AI engine (knowledge extraction + RAG chat) runs entirely locally — no external API calls, no config files, no usage limits. It works online and offline.

---

## How to use

1. **Splash → Login**: Enter your **Name + Age** (no password needed — stays on your device).
2. **Home**: Read the vision, then click **"Explore Dr. Aryan's Memory"** to load a demo scientist, or **"Preserve a Memory"** to create your own.
3. **Memories**: Your preserved profiles (only you can see them). Tap a card to open it.
4. **Profile tabs** (Overview / Upload / Memories / Graph / Timeline / Ask):
   - **Upload** — paste text or open a `.pdf` file (text is extracted automatically), then AI extracts memories, timeline, graph + thinking style.
   - **Memories** — browse/search extracted knowledge units (facts, decisions, discoveries, failures, quotes, principles).
   - **Graph** — interactive knowledge graph of how ideas connect.
   - **Timeline** — the journey of experiments, discoveries and failures across years.
   - **Ask** — chat with the preserved memory. Answers are grounded only in what they actually wrote, cited to the source memory.
5. **History**: Every conversation you've had, across all profiles.
6. **Settings**: Toggle theme (dark/light), language (English/Hindi), log out.

---

## Features

| Feature | Status |
|---------|--------|
| Name + Age login (per-user data isolation) | ✅ |
| Splash screen | ✅ |
| PDF upload + automatic text extraction | ✅ |
| AI knowledge extraction (memories, timeline, graph, thinking style) | ✅ |
| Interactive memory graph | ✅ |
| Timeline with failures as first-class | ✅ |
| RAG chat — grounded, in-voice, cited answers | ✅ |
| Conversation history | ✅ |
| English + Hindi (हिन्दी) | ✅ |
| Dark / Light theme | ✅ |
| Mobile-first native-app feel (Material 3 bottom nav, bottom sheets, page transitions) | ✅ |
| Fully responsive (zero horizontal overflow down to 320px) | ✅ |

---

## Tech stack
- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui** components
- **Prisma ORM** + **Neon PostgreSQL**
- **Local AI engine** (rule-based knowledge extraction + keyword RAG chat — no external API, works offline)
- **pdfjs-dist** (client-side PDF text extraction)
- **Framer Motion** (animations)
- **Zustand** (client state)

## Project structure
```
src/
├── app/
│   ├── api/              # API routes (auth, profiles, documents, chat, etc.)
│   ├── globals.css       # Global styles + theme (emerald brand color)
│   ├── layout.tsx        # Root layout (providers)
│   └── page.tsx          # Main app shell (splash → login → app)
├── components/
│   ├── mnemosyne/        # App components (landing, profiles, panels, nav)
│   │   └── panels/       # Profile tab panels (overview, upload, memories, graph, timeline, chat)
│   └── ui/               # shadcn/ui primitives
├── lib/
│   ├── ai.ts             # LLM: knowledge extraction + RAG chat
│   ├── api.ts            # Typed API client
│   ├── auth.ts           # Per-user auth helper (x-user-id header)
│   ├── db.ts             # Prisma client
│   ├── i18n.tsx          # English + Hindi translations
│   ├── memory-store.ts   # Extraction → DB persistence
│   └── store.ts          # Zustand app state (views, auth, navigation)
└── hooks/
prisma/
└── schema.prisma         # User, Profile, Document, Memory, GraphNode/Edge, TimelineEvent, ThinkingStyle, Conversation, Message
```

## npm scripts
| Script | What it does |
|--------|--------------|
| `npm run dev` | Start dev server on http://localhost:3000 |
| `npm run build` | Production build |
| `npm run start` | Run production server (after build) |
| `npm run lint` | ESLint check |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:push:force` | Push schema, accepting data loss |
| `npm run db:generate` | Regenerate Prisma client |

---

Built with ♥ for the generations who come next.
