'use client'

import { useMemo } from 'react'
import { motion, type Variants } from 'framer-motion'
import {
  AlertTriangle,
  BookOpen,
  FlaskConical,
  GitBranch,
  Sparkles,
  Telescope,
  Trophy,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TimelineEventData {
  id: string
  year: number
  title: string
  description: string
  type: string // experiment | discovery | publication | decision | failure | milestone
}

export interface TimelineViewProps {
  events: TimelineEventData[]
  profileName?: string
  className?: string
}

type EventType =
  | 'experiment'
  | 'discovery'
  | 'publication'
  | 'decision'
  | 'failure'
  | 'milestone'

interface TypeStyle {
  icon: LucideIcon
  label: string
  /** Year badge sitting on the spine (desktop). */
  badge: string
  /** Solid dot color (mobile node). */
  dot: string
  /** Box-shadow glow ring tinted by type. */
  glow: string
  /** Icon container background + text + ring. */
  iconWrap: string
  /** Small uppercase type-label color. */
  accentText: string
  /** Vertical accent bar on the left of each card. */
  leftBar: string
}

const TYPE_STYLES: Record<EventType, TypeStyle> = {
  experiment: {
    icon: FlaskConical,
    label: 'Experiment',
    badge:
      'border-emerald-500/40 bg-background text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    glow:
      'shadow-[0_0_0_4px_rgba(245,158,11,0.10),0_0_16px_2px_rgba(245,158,11,0.45)]',
    iconWrap:
      'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/25',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    leftBar: 'bg-gradient-to-b from-emerald-500 to-emerald-500/10',
  },
  discovery: {
    icon: Telescope,
    label: 'Discovery',
    badge:
      'border-cyan-500/40 bg-background text-cyan-700 dark:text-cyan-300',
    dot: 'bg-cyan-500',
    glow:
      'shadow-[0_0_0_4px_rgba(6,182,212,0.10),0_0_16px_2px_rgba(6,182,212,0.45)]',
    iconWrap:
      'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 ring-1 ring-cyan-500/25',
    accentText: 'text-cyan-600 dark:text-cyan-400',
    leftBar: 'bg-gradient-to-b from-cyan-500 to-cyan-500/10',
  },
  publication: {
    icon: BookOpen,
    label: 'Publication',
    badge:
      'border-violet-500/40 bg-background text-violet-700 dark:text-violet-300',
    dot: 'bg-violet-500',
    glow:
      'shadow-[0_0_0_4px_rgba(139,92,246,0.10),0_0_16px_2px_rgba(139,92,246,0.45)]',
    iconWrap:
      'bg-violet-500/15 text-violet-600 dark:text-violet-400 ring-1 ring-violet-500/25',
    accentText: 'text-violet-600 dark:text-violet-400',
    leftBar: 'bg-gradient-to-b from-violet-500 to-violet-500/10',
  },
  decision: {
    icon: GitBranch,
    label: 'Decision',
    badge:
      'border-teal-500/40 bg-background text-teal-700 dark:text-teal-300',
    dot: 'bg-teal-500',
    glow:
      'shadow-[0_0_0_4px_rgba(20,184,166,0.10),0_0_16px_2px_rgba(20,184,166,0.45)]',
    iconWrap:
      'bg-teal-500/15 text-teal-600 dark:text-teal-400 ring-1 ring-teal-500/25',
    accentText: 'text-teal-600 dark:text-teal-400',
    leftBar: 'bg-gradient-to-b from-teal-500 to-teal-500/10',
  },
  failure: {
    icon: AlertTriangle,
    label: 'Failure',
    badge:
      'border-rose-500/40 bg-background text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-500',
    glow:
      'shadow-[0_0_0_4px_rgba(244,63,94,0.12),0_0_18px_2px_rgba(244,63,94,0.55)]',
    iconWrap:
      'bg-rose-500/15 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/25',
    accentText: 'text-rose-600 dark:text-rose-400',
    leftBar: 'bg-gradient-to-b from-rose-500 to-rose-500/10',
  },
  milestone: {
    icon: Trophy,
    label: 'Milestone',
    badge:
      'border-emerald-500/40 bg-background text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    glow:
      'shadow-[0_0_0_4px_rgba(16,185,129,0.10),0_0_16px_2px_rgba(16,185,129,0.45)]',
    iconWrap:
      'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/25',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    leftBar: 'bg-gradient-to-b from-emerald-500 to-emerald-500/10',
  },
}

const DEFAULT_STYLE: TypeStyle = {
  icon: Sparkles,
  label: 'Event',
  badge:
    'border-orange-500/40 bg-background text-orange-700 dark:text-orange-300',
  dot: 'bg-orange-500',
  glow:
    'shadow-[0_0_0_4px_rgba(249,115,22,0.10),0_0_16px_2px_rgba(249,115,22,0.45)]',
  iconWrap:
    'bg-orange-500/15 text-orange-600 dark:text-orange-400 ring-1 ring-orange-500/25',
  accentText: 'text-orange-600 dark:text-orange-400',
  leftBar: 'bg-gradient-to-b from-orange-500 to-orange-500/10',
}

function getTypeStyle(type: string): TypeStyle {
  const key = type?.toLowerCase().trim() as EventType
  return TYPE_STYLES[key] ?? DEFAULT_STYLE
}

function isFailureType(type: string): boolean {
  return type?.toLowerCase().trim() === 'failure'
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 26 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: Math.min(i * 0.06, 0.36),
      ease: [0.22, 1, 0.36, 1],
    },
  }),
}

const badgeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      delay: Math.min(i * 0.04, 0.2),
      ease: [0.22, 1, 0.36, 1],
    },
  }),
}

export function TimelineView({
  events,
  profileName,
  className,
}: TimelineViewProps) {
  const sorted = useMemo(
    () => [...events].sort((a, b) => a.year - b.year),
    [events]
  )

  if (sorted.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center px-6 py-20 text-center',
          className
        )}
      >
        <div className="relative mb-6">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-violet-500/20 via-rose-500/10 to-emerald-500/20 blur-2xl"
          />
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border bg-card/70 backdrop-blur-sm">
            <Sparkles className="h-7 w-7 text-muted-foreground" />
          </div>
        </div>
        <p className="text-base font-medium text-muted-foreground">
          No timeline yet — upload knowledge to trace the journey.
        </p>
        {profileName ? (
          <p className="mt-1.5 text-sm text-muted-foreground/70">
            {profileName}&apos;s story will unfold here.
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div className={cn('relative w-full', className)}>
      {profileName ? (
        <div className="mb-10 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            The Journey of
          </p>
          <h2 className="mt-1.5 text-2xl font-semibold tracking-tight">
            {profileName}
          </h2>
        </div>
      ) : null}

      <div className="relative">
        {/* Spine: thin neutral gradient line */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-4 top-0 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-border to-transparent md:left-1/2"
        />
        {/* Desktop-only faint colored aura along the spine */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-gradient-to-b from-emerald-500/15 via-violet-500/15 to-rose-500/15 blur-[2px] md:block"
        />

        <ol className="relative space-y-6 md:space-y-10">
          {sorted.map((event, i) => {
            const style = getTypeStyle(event.type)
            const Icon = style.icon
            const isLeft = i % 2 === 0
            const failure = isFailureType(event.type)

            return (
              <li
                key={event.id}
                className="relative grid grid-cols-[2rem_1fr] items-start gap-x-4 md:grid-cols-[1fr_auto_1fr] md:gap-x-10"
              >
                {/* Mobile: glowing dot on the left spine */}
                <div className="flex justify-center md:hidden">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.4 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                    className={cn(
                      'mt-3 h-3 w-3 rounded-full ring-4 ring-background',
                      style.dot,
                      style.glow
                    )}
                  />
                </div>

                {/* Desktop: year badge sitting on the spine */}
                <div className="hidden justify-center md:flex md:col-start-2">
                  <motion.div
                    custom={i}
                    variants={badgeVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-40px' }}
                    className={cn(
                      'relative z-10 flex items-center justify-center rounded-full border px-3.5 py-1.5 text-lg font-bold tabular-nums shadow-sm',
                      style.badge,
                      style.glow
                    )}
                  >
                    {event.year}
                  </motion.div>
                </div>

                {/* Event card */}
                <motion.div
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-60px' }}
                  className={cn(
                    'relative',
                    isLeft ? 'md:col-start-1' : 'md:col-start-3'
                  )}
                >
                  <article
                    className={cn(
                      'group relative overflow-hidden rounded-xl border bg-card p-5 text-card-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
                      failure
                        ? 'border-rose-500/25 bg-rose-500/[0.035]'
                        : 'border-border'
                    )}
                  >
                    {/* Vertical accent bar (type-colored) */}
                    <span
                      aria-hidden
                      className={cn(
                        'absolute inset-y-0 left-0 w-1',
                        style.leftBar
                      )}
                    />

                    {/* Header: icon + type label + (mobile) big year */}
                    <div className="mb-3 flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                          style.iconWrap
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span
                          className={cn(
                            'text-[11px] font-semibold uppercase tracking-[0.16em]',
                            style.accentText
                          )}
                        >
                          {style.label}
                        </span>
                        <span className="text-2xl font-bold leading-tight tabular-nums md:hidden">
                          {event.year}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="mb-1.5 text-base font-semibold leading-snug">
                      {event.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {event.description}
                    </p>
                  </article>
                </motion.div>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

export default TimelineView
