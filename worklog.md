# MNEMOSYNE AI — Project Worklog

A Digital Memory Layer for Humanity. Next.js 16 + Prisma (SQLite) + z-ai-web-dev-sdk (LLM).

## Architecture
- Single `/` route, SPA-style view switching (Zustand store + URL search params).
- API routes under `/api/*`.
- AI: `z-ai-web-dev-sdk` for knowledge extraction (structured JSON) + RAG chat.
- DB: SQLite via Prisma (schema is provider-agnostic; swap datasource to Neon/Postgres in production).

## Data model (see prisma/schema.prisma)
- Profile (the preserved person)
- Document (uploaded source material)
- Memory (extracted knowledge unit: fact/decision/discovery/failure/concept/experiment/quote/principle)
- GraphNode + GraphEdge (knowledge graph)
- TimelineEvent
- ThinkingStyle (learned cognitive fingerprint)
- Conversation + Message

## Shared TypeScript interfaces (for UI components)
```ts
// graph
interface GraphNodeData { id: string; label: string; type: string; memoryId?: string | null }
interface GraphEdgeData { id: string; source: string; target: string; relationship: string }
// timeline
interface TimelineEventData { id: string; year: number; title: string; description: string; type: string }
// memory
interface MemoryData { id: string; type: string; title: string; content: string; year?: number | null; keywords: string }
```

---
Task ID: 1
Agent: Orchestrator
Task: Set up foundation — Prisma schema, DB, worklog.

Work Log:
- Authored prisma/schema.prisma with Profile/Document/Memory/GraphNode/GraphEdge/TimelineEvent/ThinkingStyle/Conversation/Message.
- Ran `bun run db:push` — SQLite DB created, Prisma Client generated.
- Initialized this worklog.

Stage Summary:
- DB ready at db/custom.db. Schema supports full digital-memory data model.

---
Task ID: 8
Agent: Memory Graph Subagent
Task: Build interactive Memory Graph visualization component

Work Log:
- Read worklog.md to understand shared interfaces (GraphNodeData / GraphEdgeData) and project conventions.
- Verified stack: Next.js 16, TypeScript, Tailwind 4, framer-motion 12, lucide-react available, shadcn `cn` helper at `@/lib/utils`.
- Created `/home/z/my-project/src/components/mnemosyne/memory-graph.tsx` as a `'use client'` component exporting `MemoryGraph` (named + default) plus the required interfaces.
- Implemented a deterministic layout engine: center the `person` node, place other nodes on concentric rings keyed by type, then run 80 iterations of force-directed relaxation (all-pairs repulsion + edge-spring attraction + gentle center gravity), followed by 12 separation passes to enforce a min-distance. All randomness is seeded by a stable hash of node id so positions don't jump between renders.
- Rendered a responsive SVG (viewBox 0 0 900 640, min-w-[600px] inside overflow-x-auto). Used useId() to namespace filter/gradient ids so multiple instances can coexist.
- Edges drawn as quadratic Bezier curves with per-edge linearGradient (source-color -> target-color), soft glow via drop-shadow on hover, wide invisible hit-area for easy hovering. `rejected` and `caused` edges render dashed to stand out.
- Edge hover shows a small pill label (relationship, capitalized) at the curve midpoint; the pill uses Tailwind fill-background/stroke-border/fill-foreground classes so it adapts to light & dark themes.
- Nodes drawn as layered circles: outer glow (SVG blur filter), main body, specular highlight. Person node is bigger (r=36), amber, double-ringed (dashed halo + solid ring), shows profileName as primary label with node label as small uppercase subtitle.
- Labels truncated with ellipsis; full label + type shown in an HTML tooltip overlay (Tailwind-styled) positioned by converting SVG user-space coords to container pixels via getBoundingClientRect.
- Color palette deliberately avoids indigo/blue: person=amber, research=emerald, discovery=cyan, decision=violet, experiment=orange, impact=rose, field=teal, method=slate. Legend (only types present in data) sits above the graph.
- Framer Motion entrance: nodes fade+scale in with stagger and backOut-style ease; edges draw in via animated pathLength. Hovering a node dims unrelated edges/nodes for focus.
- Empty state: muted centered message "No memory graph yet — upload knowledge to weave the graph." with dashed border container.
- Resolved React Compiler react-hooks/preserve-manual-memoization error by depending the layout memo on [nodes, edges] directly (layout is deterministic so re-computation is safe).
- `bun run lint` passes clean with zero errors/warnings on the new file.

Stage Summary:
- Produced: `/home/z/my-project/src/components/mnemosyne/memory-graph.tsx` (~750 lines, self-contained, only depends on react, framer-motion, @/lib/utils).
- Exports: MemoryGraph (named + default), GraphNodeData, GraphEdgeData, MemoryGraphProps.
- Lint: clean.

---
Task ID: 9
Agent: Timeline Subagent
Task: Build Timeline visualization component

Work Log:
- Read worklog.md to align with shared TimelineEventData interface (id/year/title/description/type).
- Verified available deps: framer-motion ^12, lucide-react ^0.525, shadcn/ui card primitives, cn() util, and theme tokens (bg-background/bg-card/ring-background) in globals.css.
- Created src/components/mnemosyne/timeline-view.tsx as a 'use client' component exporting TimelineView (+ default) and the exact TimelineEventData / TimelineViewProps interfaces.
- Sorted events ascending by year internally (defensive useMemo).
- Layout: responsive grid — mobile uses grid-cols-[2rem_1fr] with a glowing dot on a left spine (left-4); desktop uses grid-cols-[1fr_auto_1fr] with events alternating sides and a year-badge pill sitting on a centered spine (md:left-1/2).
- Type → color/icon mapping (NO indigo/blue): experiment→amber/FlaskConical, discovery→cyan/Telescope, publication→violet/BookOpen, decision→teal/GitBranch, failure→rose/AlertTriangle, milestone→emerald/Trophy; unknown types fall back to orange/Sparkles. Each type has badge, dot, glow shadow, iconWrap, accentText, and leftBar tokens.
- Spine: thin neutral gradient (via-border) with a faint amber→violet→rose aura blur layer on desktop. Year badges mask the spine (opaque bg-background) and carry a colored glow ring (the "glowing node").
- Failure events visually distinct: rose accent + slightly muted card (rose-tinted bg + rose border).
- Year shown prominently: text-2xl bold inside the card on mobile, text-lg bold pill on the spine on desktop. tabular-nums for alignment.
- Framer-motion: cards use whileInView with staggered delay (capped) via custom index variants; year badges scale/fade in; mobile dots pop in. Subtle hover lift (hover:-translate-y-0.5 hover:shadow-md).
- Empty state: centered muted message "No timeline yet — upload knowledge to trace the journey." with a Sparkles icon and soft gradient aura; optional profileName hint.
- Optional profileName renders an understated "The Journey of {name}" header.
- Ran `bun run lint` — clean, zero errors in the new file. Did not touch any other files.

Stage Summary:
- File produced: /home/z/my-project/src/components/mnemosyne/timeline-view.tsx
- Exports: TimelineView (named + default), TimelineEventData, TimelineViewProps.
- Responsive (mobile-first), light/dark aware via semantic tokens, premium editorial styling, framer-motion scroll-reveal stagger, failure-accented per the project's "preserve failures" theme.

---
Task ID: 2-7,10,11
Agent: Orchestrator
Task: Build AI lib, API routes, full UI (landing/profiles/detail/panels), seed data, and end-to-end verification.

Work Log:
- lib/ai.ts: extractKnowledge() (LLM → structured JSON: memories/timeline/graph/thinking-style), chatWithMemory() (keyword-overlap RAG retrieval + in-voice grounded answers + citations), buildThinkingStyle().
- lib/memory-store.ts: persistExtraction() + ingestDocument() (resolves graph edge labels→ids, upserts thinking style).
- API routes: profiles (GET/POST, [id] GET/DELETE), documents (GET/POST upload+extract), memories, graph, timeline, chat (RAG, persists conversation), conversations (GET/DELETE), seed (idempotent Dr. Aryan demo).
- UI: theme-provider (next-themes, dark default), site-header (logo + theme toggle), site-footer (sticky mt-auto), Zustand store (SPA view routing), api client lib with type colors.
- landing.tsx: hero (animated memory constellation, vision, CTAs), problem, solution flow, 6 features, moonshot pitch.
- profiles-view.tsx: profile cards + create dialog + delete + load-demo.
- profile-detail.tsx: header (avatar, thinking fingerprint, stats) + 6 tabs.
- panels: overview (fingerprint + featured memories + mini graph + recent timeline + chat CTA), upload (file/paste + AI extraction progress + source docs), memories (search + type filters), graph (MemoryGraph), timeline (TimelineView), chat (RAG conversation with suggestions + citations + typing indicator).
- seed: rich Dr. Aryan Rao (solid-state battery scientist) — 12 memories, 10 timeline events, 13 graph nodes/15 edges, thinking style, 3 demo documents. Matches PRD lithium-rejection story.
- Agent Browser verification: landing renders ✓, seed→profile ✓, chat RAG grounded+cited ✓ ("Why did you reject the lithium-metal design?" → in-voice 2028 answer) ✓, graph (44 SVG elts) ✓, timeline (all 10 events) ✓, upload+extraction (12→18 memories) ✓, mobile responsive ✓, sticky footer ✓.
- Fixed hydration mismatch: Math.sin(large radian args) produced different last-ULP floats on Node vs browser V8 → rounded constellation coords to 2 decimals; replaced framer-motion SVG circles/lines with pure CSS-animated SVG. Result: 0 hydration warnings, 0 console errors.
- bun run lint: clean.

Stage Summary:
- MNEMOSYNE AI is production-shaped and fully working end-to-end on the `/` route.
- All 6 core PRD features implemented: Knowledge Upload, AI Extraction, Memory Graph, Ask The Memory (RAG), Thinking Style Model, Timeline Memory.
- Demo memory (Dr. Aryan Rao) loads instantly via /api/seed; users can also create + upload their own.
- DB: SQLite via Prisma (schema is provider-agnostic — swap datasource to Neon/Postgres for production by changing provider + url).
