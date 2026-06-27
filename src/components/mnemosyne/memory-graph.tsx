'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface GraphNodeData {
  id: string
  label: string
  type: string // person | research | discovery | decision | experiment | impact | field | method
  memoryId?: string | null
}

export interface GraphEdgeData {
  id: string
  source: string // node id
  target: string // node id
  relationship: string // led_to | part_of | caused | rejected | discovered | used | influenced
}

export interface MemoryGraphProps {
  nodes: GraphNodeData[]
  edges: GraphEdgeData[]
  profileName?: string
  className?: string
}

/* ------------------------------------------------------------------ */
/*  Visual constants                                                   */
/* ------------------------------------------------------------------ */

const VIEW_W = 900
const VIEW_H = 640

type ColorDef = { fill: string; stroke: string; glow: string }

// Refined palette — deliberately NO indigo / blue.
const TYPE_COLORS: Record<string, ColorDef> = {
  person:     { fill: '#10b981', stroke: '#6ee7b7', glow: '#a7f3d0' }, // emerald (brand)
  research:   { fill: '#14b8a6', stroke: '#5eead4', glow: '#99f6e4' }, // teal
  discovery:  { fill: '#06b6d4', stroke: '#67e8f9', glow: '#a5f3fc' }, // cyan
  decision:   { fill: '#8b5cf6', stroke: '#c4b5fd', glow: '#ddd6fe' }, // violet
  experiment: { fill: '#f97316', stroke: '#fdba74', glow: '#fed7aa' }, // orange
  impact:     { fill: '#f43f5e', stroke: '#fda4af', glow: '#fecdd3' }, // rose
  field:      { fill: '#14b8a6', stroke: '#5eead4', glow: '#99f6e4' }, // teal
  method:     { fill: '#64748b', stroke: '#cbd5e1', glow: '#e2e8f0' }, // slate
}

const TYPE_LABELS: Record<string, string> = {
  person: 'Person',
  research: 'Research',
  discovery: 'Discovery',
  decision: 'Decision',
  experiment: 'Experiment',
  impact: 'Impact',
  field: 'Field',
  method: 'Method',
}

const TYPE_ORDER = [
  'person', 'research', 'field', 'method',
  'discovery', 'experiment', 'decision', 'impact',
]

const DEFAULT_COLOR: ColorDef = TYPE_COLORS.method

function colorFor(type: string): ColorDef {
  return TYPE_COLORS[type] ?? DEFAULT_COLOR
}

/* ------------------------------------------------------------------ */
/*  Layout engine (deterministic force-directed / radial hybrid)       */
/* ------------------------------------------------------------------ */

interface PositionedNode extends GraphNodeData {
  x: number
  y: number
  r: number
}

function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h) + 1
}

function computeLayout(
  nodes: GraphNodeData[],
  edges: GraphEdgeData[]
): PositionedNode[] {
  if (nodes.length === 0) return []

  const cx = VIEW_W / 2
  const cy = VIEW_H / 2

  // Pick a center node — prefer type === 'person', else first node.
  let centerIdx = nodes.findIndex((n) => n.type === 'person')
  if (centerIdx === -1) centerIdx = 0

  const typeRing: Record<string, number> = {}
  TYPE_ORDER.forEach((t, i) => {
    typeRing[t] = i
  })

  const typeCount: Record<string, number> = {}
  nodes.forEach((n) => {
    typeCount[n.type] = (typeCount[n.type] || 0) + 1
  })
  const typeSeen: Record<string, number> = {}

  // Seed initial positions on concentric rings around the center.
  const positions: { x: number; y: number; r: number }[] = nodes.map(
    (node, i) => {
      if (i === centerIdx) return { x: cx, y: cy, r: 36 }
      const ring = typeRing[node.type] ?? 4
      const ringRadius = 130 + ring * 56
      const idx = typeSeen[node.type] ?? 0
      typeSeen[node.type] = idx + 1
      const total = Math.max(typeCount[node.type], 1)
      const baseAngle = (ring * 1.3) % (2 * Math.PI)
      const slice = (2 * Math.PI) / Math.max(1, Math.ceil(total / 2))
      const angle = baseAngle + idx * slice
      // Deterministic per-id jitter so layout is stable across renders.
      const seed = hashStr(node.id)
      const jitter = ((seed % 1000) / 1000 - 0.5) * 44
      const radius = Math.max(50, ringRadius + jitter)
      return {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        r: node.type === 'decision' || node.type === 'impact' ? 19 : 17,
      }
    }
  )

  // Index edges by node index.
  const idToIdx = new Map<string, number>()
  nodes.forEach((n, i) => idToIdx.set(n.id, i))
  const edgeList: { s: number; t: number }[] = []
  edges.forEach((e) => {
    const s = idToIdx.get(e.source)
    const t = idToIdx.get(e.target)
    if (s !== undefined && t !== undefined && s !== t) {
      edgeList.push({ s, t })
    }
  })

  // Force-directed relaxation (repulsion + edge attraction + center gravity).
  const ITER = 80
  const K_REPEL = 16000
  const K_ATTRACT = 0.025
  const IDEAL_LEN = 170
  const MIN_DIST = 56

  for (let iter = 0; iter < ITER; iter++) {
    const fx = new Array(positions.length).fill(0)
    const fy = new Array(positions.length).fill(0)
    const cooling = 1 - iter / ITER

    // Repulsion (all pairs)
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        let dx = positions[i].x - positions[j].x
        let dy = positions[i].y - positions[j].y
        let d2 = dx * dx + dy * dy
        if (d2 < 0.01) {
          dx = (i - j) * 0.6
          dy = (i - j) * 0.6
          d2 = dx * dx + dy * dy + 0.01
        }
        const d = Math.sqrt(d2)
        const force = K_REPEL / d2
        const ux = dx / d
        const uy = dy / d
        fx[i] += ux * force
        fy[i] += uy * force
        fx[j] -= ux * force
        fy[j] -= uy * force
      }
    }

    // Attraction (springs along edges)
    for (const { s, t } of edgeList) {
      const dx = positions[t].x - positions[s].x
      const dy = positions[t].y - positions[s].y
      const d = Math.sqrt(dx * dx + dy * dy) || 0.01
      const force = K_ATTRACT * (d - IDEAL_LEN)
      const ux = dx / d
      const uy = dy / d
      fx[s] += ux * force
      fy[s] += uy * force
      fx[t] -= ux * force
      fy[t] -= uy * force
    }

    // Gentle gravity toward center (keeps the graph compact)
    for (let i = 0; i < positions.length; i++) {
      if (i === centerIdx) continue
      fx[i] += (cx - positions[i].x) * 0.006
      fy[i] += (cy - positions[i].y) * 0.006
    }

    // Apply, clamped to keep things sane.
    const step = 0.35 * cooling + 0.04
    for (let i = 0; i < positions.length; i++) {
      if (i === centerIdx) continue
      positions[i].x += Math.max(-14, Math.min(14, fx[i] * step))
      positions[i].y += Math.max(-14, Math.min(14, fy[i] * step))
    }
  }

  const pad = 56
  const clamp = (v: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, v))

  const pinCenter = () => {
    positions[centerIdx].x = cx
    positions[centerIdx].y = cy
  }

  // Final clamp.
  positions.forEach((p, i) => {
    if (i === centerIdx) {
      pinCenter()
      return
    }
    p.x = clamp(p.x, pad, VIEW_W - pad)
    p.y = clamp(p.y, pad + 6, VIEW_H - pad - 14)
  })

  // Min-distance separation passes — push overlapping nodes apart.
  for (let pass = 0; pass < 12; pass++) {
    let moved = false
    for (let i = 0; i < positions.length; i++) {
      for (let j = 0; j < positions.length; j++) {
        if (i === j) continue
        const a = positions[i]
        const b = positions[j]
        let dx = a.x - b.x
        let dy = a.y - b.y
        let d = Math.sqrt(dx * dx + dy * dy)
        const minD = MIN_DIST + (a.r + b.r) * 0.22
        if (d < minD && d > 0.01) {
          const iIsCenter = i === centerIdx
          const jIsCenter = j === centerIdx
          const push = (minD - d) * (iIsCenter ? 0 : jIsCenter ? 1 : 0.5)
          const ux = dx / d
          const uy = dy / d
          if (!iIsCenter) {
            a.x += ux * push
            a.y += uy * push
            moved = true
          }
        } else if (d < 0.01 && i !== centerIdx) {
          a.x += (i % 2 ? 1 : -1) * 3
          a.y += (i % 3 ? 1 : -1) * 3
          moved = true
        }
      }
    }
    positions.forEach((p, i) => {
      if (i === centerIdx) {
        pinCenter()
        return
      }
      p.x = clamp(p.x, pad, VIEW_W - pad)
      p.y = clamp(p.y, pad + 6, VIEW_H - pad - 14)
    })
    if (!moved) break
  }

  return nodes.map((n, i) => ({
    ...n,
    x: positions[i].x,
    y: positions[i].y,
    r: positions[i].r,
  }))
}

/* ------------------------------------------------------------------ */
/*  Geometry helpers                                                   */
/* ------------------------------------------------------------------ */

function curvePath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  curvature = 0.22
): { d: string; mid: { x: number; y: number } } {
  const dx = x2 - x1
  const dy = y2 - y1
  const d = Math.sqrt(dx * dx + dy * dy) || 1
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const px = -dy / d
  const py = dx / d
  const offset = d * curvature
  const cpx = mx + px * offset
  const cpy = my + py * offset
  return {
    d: `M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`,
    mid: { x: mx + px * offset * 0.5, y: my + py * offset * 0.5 },
  }
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1) + '\u2026'
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function MemoryGraph({
  nodes,
  edges,
  profileName,
  className,
}: MemoryGraphProps) {
  const [hoveredNode, setHoveredNode] = React.useState<string | null>(null)
  const [hoveredEdge, setHoveredEdge] = React.useState<string | null>(null)
  const [tipPos, setTipPos] = React.useState<{ x: number; y: number } | null>(
    null
  )

  const svgRef = React.useRef<SVGSVGElement>(null)
  const wrapRef = React.useRef<HTMLDivElement>(null)

  // Layout is deterministic; recomputing with identical inputs yields the
  // same positions, so depending on the array references is safe.
  const positioned = React.useMemo(
    () => computeLayout(nodes, edges),
    [nodes, edges]
  )

  const idToNode = React.useMemo(() => {
    const m = new Map<string, PositionedNode>()
    positioned.forEach((p) => m.set(p.id, p))
    return m
  }, [positioned])

  // Unique id namespace (in case multiple graphs share a page).
  const uid = React.useId().replace(/[:]/g, '')

  // Convert SVG coords -> container pixel coords for the HTML tooltip.
  const updateTip = React.useCallback(
    (nodeId: string | null) => {
      if (!nodeId) {
        setTipPos(null)
        return
      }
      const svg = svgRef.current
      const wrap = wrapRef.current
      const node = positioned.find((p) => p.id === nodeId)
      if (!svg || !wrap || !node) {
        setTipPos(null)
        return
      }
      const rect = svg.getBoundingClientRect()
      const wrapRect = wrap.getBoundingClientRect()
      const scale = Math.min(rect.width / VIEW_W, rect.height / VIEW_H)
      const offX = (rect.width - VIEW_W * scale) / 2
      const offY = (rect.height - VIEW_H * scale) / 2
      const x = rect.left - wrapRect.left + offX + node.x * scale
      const y = rect.top - wrapRect.top + offY + (node.y - node.r) * scale
      setTipPos({ x, y })
    },
    [positioned]
  )

  const handleNodeEnter = React.useCallback(
    (id: string) => {
      setHoveredNode(id)
      updateTip(id)
    },
    [updateTip]
  )
  const handleNodeLeave = React.useCallback(() => {
    setHoveredNode(null)
    setTipPos(null)
  }, [])

  const hoverNode = hoveredNode
    ? positioned.find((p) => p.id === hoveredNode) ?? null
    : null

  const legendTypes = React.useMemo(() => {
    const set = new Set<string>()
    positioned.forEach((p) => set.add(p.type))
    return Array.from(set).sort(
      (a, b) => TYPE_ORDER.indexOf(a) - TYPE_ORDER.indexOf(b)
    )
  }, [positioned])

  /* --------------------------- empty state --------------------------- */

  if (positioned.length === 0) {
    return (
      <div className={cn('relative w-full', className)}>
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/25 bg-muted/10 px-6 py-16 text-center">
          <div
            aria-hidden
            className="mb-5 h-14 w-14 rounded-full border border-muted-foreground/20 bg-muted/20"
          />
          <p className="text-sm text-muted-foreground">
            No memory graph yet — upload knowledge to weave the graph.
          </p>
        </div>
      </div>
    )
  }

  /* ----------------------------- render ------------------------------ */

  return (
    <div ref={wrapRef} className={cn('relative w-full', className)}>
      {/* Legend */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {legendTypes.map((t) => {
          const c = colorFor(t)
          return (
            <div
              key={t}
              className="flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/30 px-2 py-1 text-[11px]"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  background: c.fill,
                  boxShadow: `0 0 6px ${c.glow}`,
                }}
              />
              <span className="text-muted-foreground">
                {TYPE_LABELS[t] ?? t}
              </span>
            </div>
          )
        })}
      </div>

      {/* SVG graph */}
      <div className="overflow-x-auto rounded-xl border border-border/50 bg-gradient-to-br from-background to-muted/20">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-auto w-full min-w-[600px]"
          style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
          role="img"
          aria-label="Memory knowledge graph"
        >
          <defs>
            <filter
              id={`${uid}-glow`}
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient
              id={`${uid}-bg`}
              cx="50%"
              cy="50%"
              r="55%"
            >
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            {edges.map((e) => {
              const s = idToNode.get(e.source)
              const t = idToNode.get(e.target)
              if (!s || !t) return null
              const c1 = colorFor(s.type).fill
              const c2 = colorFor(t.type).fill
              return (
                <linearGradient
                  key={e.id}
                  id={`${uid}-eg-${e.id}`}
                  x1={s.x}
                  y1={s.y}
                  x2={t.x}
                  y2={t.y}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor={c1} stopOpacity="0.75" />
                  <stop offset="100%" stopColor={c2} stopOpacity="0.75" />
                </linearGradient>
              )
            })}
          </defs>

          {/* Subtle radial backdrop */}
          <rect
            x="0"
            y="0"
            width={VIEW_W}
            height={VIEW_H}
            fill={`url(#${uid}-bg)`}
          />

          {/* Edges */}
          <g>
            {edges.map((e, i) => {
              const s = idToNode.get(e.source)
              const t = idToNode.get(e.target)
              if (!s || !t) return null
              const isDashed =
                e.relationship === 'rejected' || e.relationship === 'caused'
              const isHover = hoveredEdge === e.id
              const isRelated =
                hoveredNode === e.source || hoveredNode === e.target
              const dim = hoveredNode !== null && !isRelated
              const { d, mid } = curvePath(s.x, s.y, t.x, t.y)
              const label = e.relationship.replace(/_/g, ' ')
              const labelW = label.length * 6.4 + 14
              return (
                <g
                  key={e.id}
                  style={{
                    opacity: dim ? 0.22 : 1,
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  {/* Invisible wide hit-area */}
                  <path
                    d={d}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={14}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredEdge(e.id)}
                    onMouseLeave={() => setHoveredEdge(null)}
                  />
                  <motion.path
                    d={d}
                    fill="none"
                    stroke={`url(#${uid}-eg-${e.id})`}
                    strokeWidth={isHover || isRelated ? 2.6 : 1.5}
                    strokeLinecap="round"
                    strokeDasharray={isDashed ? '7 5' : undefined}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      duration: 0.9,
                      delay: 0.25 + i * 0.035,
                      ease: 'easeInOut',
                    }}
                    style={{
                      filter: isHover
                        ? `drop-shadow(0 0 5px ${colorFor(t.type).glow})`
                        : undefined,
                      transition: 'stroke-width 0.2s ease',
                    }}
                  />
                  {isHover && (
                    <g pointerEvents="none">
                      <rect
                        x={mid.x - labelW / 2}
                        y={mid.y - 10}
                        width={labelW}
                        height={20}
                        rx={10}
                        className="fill-background stroke-border"
                        strokeWidth={1}
                        opacity={0.96}
                      />
                      <text
                        x={mid.x}
                        y={mid.y + 4}
                        textAnchor="middle"
                        fontSize={10}
                        fontWeight={500}
                        className="fill-foreground"
                        style={{ textTransform: 'capitalize' }}
                      >
                        {label}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}
          </g>

          {/* Nodes */}
          <g>
            {positioned.map((n, i) => {
              const c = colorFor(n.type)
              const isPerson = n.type === 'person'
              const isHover = hoveredNode === n.id
              const dim = hoveredNode !== null && !isHover
              const labelText =
                isPerson && profileName ? profileName : n.label
              const subLabel =
                isPerson && profileName && n.label !== profileName
                  ? n.label
                  : null
              return (
                <motion.g
                  key={n.id}
                  initial={{ opacity: 0, scale: 0.2 }}
                  animate={{
                    opacity: dim ? 0.35 : 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.45,
                    delay: 0.05 + i * 0.04,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                  style={{
                    transformBox: 'fill-box',
                    transformOrigin: 'center',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => handleNodeEnter(n.id)}
                  onMouseLeave={handleNodeLeave}
                >
                  {isPerson && (
                    <>
                      {/* Outer dashed halo */}
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r={n.r + 14}
                        fill="none"
                        stroke={c.stroke}
                        strokeWidth={1}
                        strokeDasharray="3 5"
                        opacity={0.55}
                      />
                      {/* Inner ring */}
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r={n.r + 8}
                        fill="none"
                        stroke={c.stroke}
                        strokeWidth={2}
                        opacity={0.75}
                      />
                    </>
                  )}
                  {/* Soft glow */}
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={n.r}
                    fill={c.glow}
                    opacity={isHover ? 0.6 : 0.32}
                    filter={`url(#${uid}-glow)`}
                  />
                  {/* Main body */}
                  <motion.circle
                    cx={n.x}
                    cy={n.y}
                    r={n.r}
                    fill={c.fill}
                    stroke={isHover ? '#ffffff' : c.stroke}
                    strokeWidth={isHover ? 3 : isPerson ? 2.5 : 2}
                    initial={false}
                    animate={{ scale: isHover ? 1.14 : 1 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      transformBox: 'fill-box',
                      transformOrigin: 'center',
                    }}
                  />
                  {/* Specular highlight */}
                  <circle
                    cx={n.x - n.r * 0.32}
                    cy={n.y - n.r * 0.32}
                    r={n.r * 0.28}
                    fill="white"
                    opacity={0.28}
                  />
                  {/* Label */}
                  <text
                    x={n.x}
                    y={n.y + n.r + 15}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={isPerson ? 700 : 500}
                    className="fill-foreground"
                  >
                    {truncate(labelText, isPerson ? 18 : 16)}
                  </text>
                  {subLabel && (
                    <text
                      x={n.x}
                      y={n.y + n.r + 28}
                      textAnchor="middle"
                      fontSize={9}
                      className="fill-muted-foreground uppercase tracking-wider"
                    >
                      {truncate(subLabel, 20)}
                    </text>
                  )}
                </motion.g>
              )
            })}
          </g>
        </svg>
      </div>

      {/* HTML tooltip overlay */}
      {hoverNode && tipPos && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-lg border border-border/70 bg-popover/95 px-3 py-2 text-xs shadow-lg backdrop-blur"
          style={{ left: tipPos.x, top: tipPos.y - 10 }}
        >
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                background: colorFor(hoverNode.type).fill,
                boxShadow: `0 0 6px ${colorFor(hoverNode.type).glow}`,
              }}
            />
            <span className="font-medium text-popover-foreground">
              {hoverNode.label}
            </span>
          </div>
          <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            {TYPE_LABELS[hoverNode.type] ?? hoverNode.type}
            {hoverNode.memoryId && (
              <span className="ml-1 opacity-60">· memory</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MemoryGraph
