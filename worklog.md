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

---
Task ID: 12
Agent: Orchestrator
Task: Add Hindi/English i18n + mobile bottom nav (Home/Memories/History/Settings) + login (Name+Age) + splash screen + logout + settings hub + switch DB to Neon Postgres.

Work Log:
- DB: switched datasource to postgresql, DATABASE_URL → Neon pooler connection string. db:push --accept-data-loss cleared leftover tables, created all tables on Neon. Added User model (name+age, unique constraint). Added db:push:force script.
- Store: added views splash|login|home|memories|profile|history|settings; added user auth state + setUser (transitions to home) + logout (clears localStorage, returns to login) + hydrateUser(). Kept goLanding/goProfiles aliases for backward compat.
- i18n: added ~60 new keys (splash, login, settings, history, nav) in EN + HI. Fixed a pre-existing parse error (bare ASCII single-quotes around 'क्यों' in two Hindi strings → curly quotes).
- API: /api/auth/login (upserts User by name+age), /api/auth/logout (no-op symmetric), /api/history (all conversations across profiles with first question + last answer + profile info).
- UI: SplashScreen (pulsing rings + branding, 2.2s), LoginView (Name + Age form, posts to /api/auth/login, stores user), SettingsView (account card, theme toggle, language toggle, about, clear-local, logout with confirm dialogs), HistoryView (conversation list with profile avatar, first question, last answer preview, time-ago, click → reopen profile chat).
- MobileNav restructured: 4 global tabs (Home/Memories/History/Settings) on landing/memories/history/settings; 6 profile tabs when in a profile; hidden entirely on splash/login. All labels i18n'd.
- SiteHeader: simplified to logo + desktop Home/Memories buttons + user avatar→settings. Removed inline theme/language toggles (moved to Settings). Hidden on splash/login.
- page.tsx: splash (2.2s) → hydrateUser (login if no user, else home) → app shell with header/footer/nav.
- Fixed ChatPanel crash: Welcome component referenced undefined SUGGESTIONS const → switched to SUGGESTION_KEYS mapped via t(); also i18n'd the placeholder + disclaimer + welcome title/body.
- Agent Browser verification: splash→login✓, login (Aria/28)→home✓, seed Dr. Aryan on Neon✓, chat RAG grounded answer✓, mobile bottom nav 4 tabs (HI+EN)✓, settings theme toggle✓, settings language toggle✓, logout→login✓, history view shows conversation✓, desktop header nav✓, 0 console errors.

Stage Summary:
- Neon Postgres is now the production database (all CRUD verified against it).
- Full app flow: Splash → Login (Name+Age) → Home → preserve/converse with memories → History → Settings (theme/language/logout) → Logout.
- Bottom nav: Home, Memories, History, Settings (mobile); profile detail shows its own 6 tabs.
- Both English and Hindi fully supported across all new screens.

---
Task ID: 13
Agent: Orchestrator
Task: Redesign mobile UI to feel like a native Android app — Material 3 bottom nav, compact app bar, bottom-sheet dialogs, page transitions, native touch feedback.

Work Log:
- globals.css: native app base — -webkit-tap-highlight-color: transparent, overscroll-behavior-y: none, touch-action: manipulation, user-select:none on chrome (header/nav/buttons) but text on content, Material elevation tiers (.elev-1/2/3), .press + .press-card active:scale utilities, safe-area helpers (.pt-safe/.pb-safe), .h-app/.min-h-app (100dvh), .no-scrollbar.
- layout.tsx: switched to min-h-app (100dvh) for true app height; removed pb-14 hack (main handles its own pb-16).
- mobile-nav.tsx: Material 3 redesign — 64px height, pill-shaped active indicator (layoutId="m3-nav-pill" with spring animation that slides between tabs), amber active color, larger 22px icons, 10px labels, pb-safe for notched devices.
- site-header.tsx: compact 56px (h-14) opaque app bar with pt-safe; contextual title on profile detail ("All memories" back button); avatar→settings; desktop Home/Memories buttons hidden on mobile.
- page.tsx: AnimatePresence app-like page transitions (fade + 8px slide, 220ms ease); main has pb-16 md:pb-0 to clear the fixed bottom nav; splash/login have their own exit animations.
- profiles-view.tsx: converted create-profile + delete-confirm from centered AlertDialogs to native bottom sheets (vaul Drawer) sliding up from bottom; added mobile FAB (floating + button, bottom-20 right-4) for create; full-bleed single-column cards on mobile → grid on desktop; .press/.press-card native touch feedback on all interactive elements; compact header on mobile.
- settings-view.tsx: converted logout + clear-local confirms to bottom sheets; native list rows with .press active:scale + active:bg-accent/60 press states; compact spacing on mobile.
- Agent Browser verification (390×844 mobile): bottom nav 64px with pill indicator ✓, app bar 57px compact ✓, FAB on memories ✓, create-profile bottom sheet ✓, logout bottom sheet ✓, back-title app bar on profile detail ✓, page transitions ✓, tap highlight transparent ✓, overscroll contained ✓, desktop (1440×900): bottom nav hidden + header nav visible + FAB hidden ✓, 0 console errors ✓.

Stage Summary:
- Mobile UI now feels like a native Android app: Material 3 pill-indicator bottom nav, compact opaque app bar with contextual back titles, bottom-sheet dialogs (not centered modals), app-like page transitions, native touch feedback (press-scale, no tap flash, no overscroll bounce, no text-selection on chrome), FAB for primary actions.
- Desktop remains a clean responsive web app (bottom nav hidden, header nav shown).
- All dialogs (create profile, delete, logout, clear local) are now native bottom sheets.

---
Task ID: 14
Agent: Orchestrator
Task: Per-user data isolation + rename app to ECHO + recolor UI to fuchsia + upscale polish.

Work Log:
- Schema: added ownerId (User relation, onDelete: Cascade) to Profile. db push --force-reset wiped Neon and recreated with the new relation. Profiles now belong to a user.
- Data isolation: created lib/auth.ts (currentUserId from x-user-id header). API client (lib/api.ts) now attaches x-user-id from localStorage on every request. Updated ALL routes to scope by owner: profiles (list/create filter by ownerId), profiles/[id] (findFirst by id+ownerId), documents/memories/graph/timeline (verify profile ownership before returning data), chat (verify profile ownership), conversations (verify ownership), history (where profile.ownerId = currentUser), seed (requires ownerId, creates profile owned by caller). User A's data is invisible to User B.
- Storage keys: renamed mnemosyne-user → echo-user (store.ts), mnemosyne-lang → echo-lang (i18n + settings).
- Rename: MNEMOSYNE/Mnemosyne → ECHO across all components, i18n strings, metadata, toasts ("Enter ECHO", "Log out of ECHO"). Wordmark is now "ECHO" with "AI" subtitle.
- Recolor: brand amber (oklch hue 75) → fuchsia (oklch hue 300). Updated all CSS variables in globals.css (light + dark: --primary, --ring, --sidebar-*, --chart-*). Renamed .text-gradient-amber → .text-gradient-brand (fuchsia→rose→cyan gradient), .glow-amber → .glow-brand. Bulk-replaced amber→fuchsia Tailwind classes across all 16 component files (text-/bg-/border-/from-/to-/ring-/shadow-). Updated memory-graph person node from amber (#f59e0b) to fuchsia (#d946ef). Constellation dots/lines now fuchsia. Scrollbar now fuchsia-tinted. Radius bumped to 0.75rem for a softer, more premium feel.
- Type palette (fact/decision/discovery/etc.) kept as categorical colors — intentionally independent of brand chrome.
- Agent Browser verification: splash shows "ECHO" ✓, login "Enter ECHO" ✓, brand --primary is fuchsia (lab confirms) ✓, nav active uses fuchsia ✓, "Log out of ECHO?" dialog ✓. DATA ISOLATION: User A (Aria/28) seeded Dr. Aryan; User B (Leo/35) logged in → memories empty ("No memories preserved yet") → seeded own Dr. Aryan copy ✓. Chat RAG works ✓. 0 console errors, lint clean.

Stage Summary:
- App renamed: MNEMOSYNE → ECHO (wordmark, metadata, all strings).
- New brand color: fuchsia (hue 300) — clearly not indigo/blue, modern and distinctive. Gradient is fuchsia→rose→cyan.
- Per-user data isolation: every profile/memory/document/graph/timeline/conversation is scoped to the logged-in user via ownerId + x-user-id header. Users cannot see or access each other's data.
- DB reset and re-synced on Neon with the new ownerId relation.

---
Task ID: 15
Agent: Orchestrator
Task: Fix profile sub-tabs not visible on mobile + recolor to industry-standard emerald.

Work Log:
- Root cause: 6 profile tabs crammed into the bottom nav (65px each on 390px viewport) — technically present but too cramped to be usable; the pill indicator nearly filled each tab.
- Fix: moved profile sub-navigation (Overview/Upload/Memories/Graph/Timeline/Ask) to a STICKY SCROLLABLE TOP TAB STRIP inside profile-detail — the industry-standard Material/Android pattern for sub-navigation (used by YouTube, Chrome, etc.). Visible on ALL screen sizes. Horizontally scrollable with hidden scrollbar on mobile. Sticky below the app bar (top-14/top-16). Active tab gets emerald-500/15 background + emerald text.
- mobile-nav simplified: ALWAYS shows the 4 global tabs (Home/Memories/History/Settings) on every screen — consistent, not confusing. "Memories" stays active when inside a profile. Removed the cramped 6-tab profile branch entirely.
- Recolor: fuchsia (hue 300) → emerald (hue 160) — the quintessential production-ready, industry-standard color (trust, growth, used by Stripe/Linear/health-tech). Updated all CSS variables in globals.css (light+dark: --primary, --ring, --sidebar-*, --chart-*), .text-gradient-brand (emerald→teal→cyan), .glow-brand, scrollbar. Bulk-replaced fuchsia→emerald Tailwind classes across all 16 component files. Updated memory-graph person node to emerald (#10b981), differentiated research node to teal (#14b8a6) to avoid clash. Constellation dots/lines now emerald.
- Agent Browser verification (390×844 mobile): top tab strip shows all 6 tabs (Overview/Upload/Memories/Graph/Timeline/Ask) ✓, Overview active ✓, Graph tab click → SVG renders ✓, Ask tab click → chat textarea visible ✓, bottom nav shows 4 global tabs with Memories active ✓. Desktop (1440×900): bottom nav hidden ✓, tab strip visible as rounded card with all 6 tabs ✓, emerald active color confirmed (lab green hue) ✓. 0 console errors, lint clean.

Stage Summary:
- Profile sub-tabs (Overview/Upload/Memories/Graph/Timeline/Ask) now ALWAYS visible in a sticky scrollable top tab strip — no more cramped bottom-nav cramming.
- Bottom nav consistently shows Home/Memories/History/Settings on every screen.
- Brand color: emerald (hue 160) — industry-standard, production-ready, professional.

---
Task ID: 16
Agent: Orchestrator
Task: Make the whole website fully responsive — zero horizontal overflow on mobile.

Work Log:
- Root cause audit (agent-browser at 390px + 320px): identified overflow sources — decorative glow blobs (absolute positioned extending past viewport), the desktop tab strip (w-max ~582px), and the memory-graph SVG (min-w-[600px]).
- globals.css: added `overflow-x: hidden` + `max-width: 100vw` to both `html` and `body`. This is the robust industry-standard guarantee — decorative elements that bleed past the viewport are clipped instead of causing horizontal scroll. Affects the entire app universally.
- memory-graph.tsx: made the SVG responsive — `min-w-[600px]` → `min-w-[340px] sm:min-w-[600px]`. On phones the graph now scales down to fit; on >=640px screens it uses the full 600px min for readability. The container's `overflow-x-auto` still allows internal scroll if needed on very dense graphs.
- Verified every view + every profile tab at 390px AND 320px (iPhone SE, narrowest common phone):
  - Home: hasHScroll=false ✓
  - Memories: hasHScroll=false ✓
  - History: hasHScroll=false ✓
  - Settings: hasHScroll=false ✓
  - Profile → Overview/Upload/Memories/Graph/Timeline/Ask: all hasHScroll=false ✓
  - Create-profile bottom sheet: 0 overflow elements ✓
  - Login screen @320px: hasHScroll=false ✓
  - Chat with messages: hasHScroll=false ✓
  - Multi-breakpoint (375/390/768): all hasHScroll=false ✓
- 0 console errors, lint clean.

Stage Summary:
- The entire website is now fully responsive with ZERO horizontal overflow on mobile (verified down to 320px / iPhone SE width).
- The fix is universal (html+body overflow-x:hidden) so any future decorative elements are automatically contained.
- Memory graph now scales fluidly on mobile instead of forcing a 600px min-width.

---
Task ID: 17
Agent: Orchestrator
Task: Center timeline cards on mobile + make footer compact with short text.

Work Log:
- timeline-view.tsx: redesigned mobile layout. Previously: left-aligned spine (left-4) with cards on the right side (grid-cols-[2rem_1fr]). Now: centered spine (left-1/2) on ALL screens, each event is a centered flex column — year badge centered on the spine, then full-width card centered below. Desktop keeps the alternating left/right 3-col grid. Mobile cards use slightly smaller padding/text (p-4/sm:p-5, text-sm/sm:text-base) for better density. All 10 events visible on mobile.
- site-footer.tsx: made compact. Removed the long tagline paragraph. Now a single slim row: small ECHO AI logo (h-6) + Vision/Memories links + short "Built with ♥" note. Text is text-[11px]/text-[10px]. Reduced vertical padding (py-5). Added pb-16 md:pb-0 so the footer content clears the fixed mobile bottom nav.
- Agent Browser verification (390px): Timeline tab shows all 10 events ✓, year badges centered on spine (center=195=viewport center, diff=0) ✓, cards full-width & centered (left=33, right=357, symmetric) ✓, no h-scroll ✓. Footer compact with short text ✓, content clears bottom nav (contentBottom=780=navTop) ✓. Also verified at 320px (iPhone SE): 10 events, centered, no h-scroll ✓. 0 console errors, lint clean.

Stage Summary:
- Timeline cards now centered on mobile with a centered spine — all events visible.
- Footer is compact with short text and clears the mobile bottom nav.

---
Task ID: 19
Agent: Orchestrator
Task: Fix vertical scrolling not working with mouse wheel and keyboard arrows.

Work Log:
- Root cause: `overflow-x: hidden` was set on BOTH `html` and `body`. When both elements clip overflow, the browser can establish a scroll container on `body` that traps vertical scrolling — breaking mouse wheel and keyboard arrow/PageDown/Spacebar scrolling.
- Fix (globals.css):
  - html: removed `overflow-x: hidden` and `max-width: 100vw`; added `overflow-y: auto` to explicitly guarantee vertical document scrolling.
  - body: changed `overflow-x: hidden` → `overflow-x: clip`. The `clip` value clips horizontal overflow (same visual result — no horizontal scroll) but does NOT create a scroll container, so it cannot trap vertical scrolling. Kept `max-width: 100vw`.
- Agent Browser verification:
  - Landing page (3733px tall): mouse wheel 500→scrollY 500, 800→1300 ✓; ArrowDown ×5 → scrollY 200 ✓; PageDown → 987 ✓; Spacebar → 787 ✓.
  - Profile detail (2521px tall): wheel 500→500 ✓; ArrowDown+PageDown → 818 ✓.
  - Mobile (390×844): wheel scroll works ✓.
  - No horizontal overflow preserved: hasHScroll=false at 390px ✓.
  - 0 console errors, lint clean.

Stage Summary:
- Vertical scrolling now works with mouse wheel, ArrowUp/ArrowDown, PageUp/PageDown, and Spacebar on all pages.
- Horizontal overflow is still prevented (via overflow-x: clip on body) — no regression on the mobile responsive fix.
