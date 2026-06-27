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
The app uses **Neon PostgreSQL** (serverless Postgres). The connection string is already in `.env`:
```
DATABASE_URL="postgresql://neondb_owner:npg_8myzUEKTGM6x@ep-misty-meadow-ahg28g5g-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```
Push the schema to create all tables:
```bash
npm run db:push
```

> **Want your own database?** Create a free Neon project at [neon.tech](https://neon.tech), copy its connection string into `.env`, then run `npm run db:push`.

### 3. Set up the AI (z-ai SDK)
The app uses the **z-ai-web-dev-sdk** for knowledge extraction and RAG chat. It needs a `.z-ai-config` file in the project root. A working config file is **already included** in this project (`.z-ai-config`).

If it's missing or you need your own credentials, create `.z-ai-config` in the project root:
```json
{
  "baseUrl": "https://internal-api.z.ai/v1",
  "apiKey": "Z.ai",
  "chatId": "your-chat-id",
  "token": "your-jwt-token",
  "userId": "your-user-id"
}
```

> **Note:** The `.z-ai-config` file is in `.gitignore` (it contains auth tokens). If the AI features aren't working locally, check that this file exists — without it, document uploads will still save but won't extract memories, and chat will return a graceful "AI unavailable" message instead of crashing.

### 4. Start the dev server
```bash
npm run dev
```
Open **http://localhost:3000** in your browser.

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
- **z-ai-web-dev-sdk** (LLM for extraction + RAG chat)
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
