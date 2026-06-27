---
Task ID: 8
Agent: Memory Graph Subagent
Task: Build interactive Memory Graph visualization component

Work Log:
- Read worklog.md to understand shared interfaces (GraphNodeData / GraphEdgeData) and project conventions.
- Verified stack: Next.js 16, TypeScript, Tailwind 4, framer-motion 12, lucide-react available, shadcn `cn` helper at `@/lib/utils`.
- Created `/home/z/my-project/src/components/mnemosyne/memory-graph.tsx` as a `'use client'` component exporting `MemoryGraph` (with default export too) plus the required interfaces.
- Implemented a deterministic layout engine: center the `person` node, place other nodes on concentric rings keyed by type, then run 80 iterations of force-directed relaxation (all-pairs repulsion + edge-spring attraction + gentle center gravity), followed by 12 separation passes to enforce a min-distance. All randomness is seeded by a stable hash of node id, so positions don't jump between renders.
- Rendered a responsive SVG (`viewBox 0 0 900 640`, `min-w-[600px]` inside `overflow-x-auto`). Used `useId()` to namespace filter/gradient ids so multiple instances can coexist.
- Edges drawn as quadratic Bézier curves with per-edge `linearGradient` (source-color → target-color), soft glow via drop-shadow on hover, and a wide invisible hit-area for easy hovering. `rejected` and `caused` edges render dashed to stand out.
- Edge hover shows a small pill label (`relationship`, capitalized) at the curve midpoint; the pill uses Tailwind `fill-background`/`stroke-border`/`fill-foreground` classes so it adapts to light & dark themes.
- Nodes drawn as layered circles: outer glow (SVG blur filter), main body, specular highlight. Person node is bigger (r=36), amber, double-ringed (dashed halo + solid ring), and shows `profileName` as primary label with the node label as a small uppercase subtitle.
- Labels truncated with ellipsis; full label + type shown in an HTML tooltip overlay (Tailwind-styled) positioned by converting SVG user-space coords to container pixels via `getBoundingClientRect`.
- Color palette deliberately avoids indigo/blue: person=amber, research=emerald, discovery=cyan, decision=violet, experiment=orange, impact=rose, field=teal, method=slate. A legend (only types present in the data) sits above the graph.
- Framer Motion entrance: nodes fade+scale in with a stagger and a `backOut`-style ease; edges draw in via animated `pathLength`. Hovering a node dims unrelated edges/nodes for focus.
- Empty state: muted centered message "No memory graph yet — upload knowledge to weave the graph." with a dashed border container.
- Resolved a React Compiler `react-hooks/preserve-manual-memoization` error by depending the layout memo on `[nodes, edges]` directly (layout is deterministic so re-computation is safe).
- `bun run lint` passes clean with zero errors/warnings on the new file.

Stage Summary:
- Produced: `/home/z/my-project/src/components/mnemosyne/memory-graph.tsx` (~750 lines, self-contained, only depends on `react`, `framer-motion`, `@/lib/utils`).
- Exports: `MemoryGraph` (named + default), `GraphNodeData`, `GraphEdgeData`, `MemoryGraphProps`.
- Lint: clean.
