'use client'

import { motion } from 'framer-motion'
import {
  Brain,
  Sparkles,
  Upload,
  Network,
  MessagesSquare,
  GitBranch,
  Clock,
  ArrowRight,
  FileText,
  AudioLines,
  Code2,
  BookOpen,
  Quote,
  FlaskConical,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/lib/store'
import { api } from '@/lib/api'
import { useState } from 'react'
import { toast } from 'sonner'

export function Landing() {
  const { goProfiles, openProfile } = useApp()
  const [seeding, setSeeding] = useState(false)

  async function exploreDemo() {
    setSeeding(true)
    const t = toast.loading('Awakening Dr. Aryan Rao\'s preserved memory…')
    try {
      const { profile } = await api.seed()
      toast.success('Digital memory ready.', { id: t })
      openProfile(profile.id, 'overview')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to seed demo', { id: t })
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div>
      {/* ───────────────────────── HERO ───────────────────────── */}
      <section className="relative overflow-hidden">
        {/* background layers */}
        <div className="absolute inset-0 -z-10 bg-grid opacity-60" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-amber-500/[0.07] via-transparent to-transparent" />
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-amber-500/20 blur-[120px]" />
        <div className="pointer-events-none absolute top-20 -right-20 -z-10 h-[30rem] w-[30rem] rounded-full bg-emerald-500/15 blur-[120px]" />
        <Constellation />

        <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <Badge
              variant="outline"
              className="mb-6 gap-2 border-amber-500/30 bg-amber-500/10 px-3 py-1 text-amber-600 dark:text-amber-300"
            >
              <Sparkles className="h-3 w-3" />
              A Digital Memory Layer for Humanity
            </Badge>

            <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Preserving human intelligence
              <br />
              <span className="text-gradient-amber">beyond human lifespan.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
              When a great scientist dies, their reasoning disappears with them — the papers
              survive, but the <em className="text-foreground/90">why</em> does not. Mnemosyne
              distills a person&apos;s writings, notes and failures into a living knowledge graph you
              can converse with, forever.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={exploreDemo}
                disabled={seeding}
                className="glow-amber h-12 gap-2 bg-gradient-to-br from-amber-500 to-amber-600 px-7 text-base font-semibold text-amber-950 hover:from-amber-400 hover:to-amber-500"
              >
                <Brain className="h-5 w-5" />
                {seeding ? 'Awakening…' : 'Explore Dr. Aryan\'s Memory'}
                {!seeding && <ArrowRight className="h-4 w-4" />}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={goProfiles}
                className="h-12 gap-2 px-7 text-base"
              >
                <Upload className="h-4 w-4" />
                Preserve a Memory
              </Button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              No signup. Try the live demo of a solid-state battery scientist&apos;s preserved mind.
            </p>
          </motion.div>

          {/* stat strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 sm:grid-cols-4"
          >
            {[
              { k: 'Knowledge', v: 'Extracted' },
              { k: 'Reasoning', v: 'Preserved' },
              { k: 'Failures', v: 'First-class' },
              { k: 'Answers', v: 'Grounded' },
            ].map((s) => (
              <div key={s.k} className="bg-background/80 px-4 py-5 text-center backdrop-blur">
                <div className="text-lg font-semibold text-amber-500">{s.v}</div>
                <div className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">
                  {s.k}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────────────────────── PROBLEM ───────────────────────── */}
      <section className="border-t border-border/50 bg-background/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">
                The problem
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                A scientist publishes 100 papers.
                <br />
                Then dies — and the <span className="text-rose-500">reasoning</span> vanishes.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                Human knowledge lives fragmented across papers, emails, notebooks and code. The
                published record hides a hundred dead ends. After death, nobody knows why a method
                was chosen, what failures shaped it, or what intuition guided the breakthroughs.
                Future generations cannot ask a single question.
              </p>
              <div className="mt-6 space-y-2.5">
                {[
                  'Information is fragmented across formats',
                  'Context & decision-making process disappears',
                  'Failures are never published',
                  'You cannot ask the dead a question',
                ].map((t) => (
                  <div key={t} className="flex items-center gap-3 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    <span className="text-muted-foreground">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="relative overflow-hidden border-rose-500/20 bg-rose-500/[0.03]">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2 text-sm font-medium text-rose-500">
                  <Quote className="h-4 w-4" /> What survives today
                </div>
                <div className="space-y-3">
                  {[
                    { icon: FileText, label: 'Research_Paper.pdf', note: 'the what' },
                    { icon: BookOpen, label: 'Experiment_Log.md', note: 'the result' },
                    { icon: Code2, label: 'repository.git', note: 'the how' },
                    { icon: AudioLines, label: 'interview.mp3', note: 'the anecdote' },
                  ].map((d) => (
                    <div
                      key={d.label}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 px-3 py-2.5"
                    >
                      <span className="flex items-center gap-2.5 text-sm">
                        <d.icon className="h-4 w-4 text-muted-foreground" />
                        <code className="font-mono text-xs">{d.label}</code>
                      </span>
                      <span className="text-xs italic text-muted-foreground">{d.note}</span>
                    </div>
                  ))}
                  <div className="!mt-5 rounded-lg border border-dashed border-rose-500/40 bg-rose-500/5 px-3 py-3 text-center text-sm text-rose-600 dark:text-rose-300">
                    But the <strong>why</strong>? Gone.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ───────────────────────── SOLUTION / FLOW ───────────────────────── */}
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">
              The solution
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              From scattered artifacts to a mind you can talk to.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Mnemosyne reads everything a person left behind and weaves it into a structured
              Digital Memory — knowledge units, a reasoning graph, a timeline, and a thinking-style
              fingerprint. Then it answers questions in their voice, grounded only in what they
              actually wrote.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-4">
            {[
              {
                icon: Upload,
                step: '01',
                title: 'Upload knowledge',
                desc: 'PDFs, notes, markdown, transcripts, code. The raw footprint of a mind.',
              },
              {
                icon: Sparkles,
                step: '02',
                title: 'AI extraction',
                desc: 'Facts, decisions, discoveries, failures and principles — pulled into structured memory.',
              },
              {
                icon: Network,
                step: '03',
                title: 'Memory graph',
                desc: 'A living graph of how ideas, experiments and outcomes connect and influence each other.',
              },
              {
                icon: MessagesSquare,
                step: '04',
                title: 'Ask the memory',
                desc: 'Converse in their voice. Grounded answers, cited to the exact preserved memory.',
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Card className="group h-full border-border/60 transition-colors hover:border-amber-500/40 hover:bg-amber-500/[0.03]">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="flex items-center justify-between">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-amber-500/15 to-emerald-500/15 ring-1 ring-amber-500/20 transition-transform group-hover:scale-105">
                        <s.icon className="h-5 w-5 text-amber-500" />
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">{s.step}</span>
                    </div>
                    <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── FEATURES ───────────────────────── */}
      <section className="border-t border-border/50 bg-background/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
              Core capabilities
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Six layers of a preserved mind.
            </h2>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Upload,
                title: 'Knowledge Upload',
                desc: 'Ingest PDF, TXT, Markdown and transcripts. Every artifact becomes a source node in the memory.',
              },
              {
                icon: Sparkles,
                title: 'AI Knowledge Extraction',
                desc: 'Distills facts, concepts, relationships, decisions and the timeline of a life\'s work.',
              },
              {
                icon: Network,
                title: 'Memory Graph',
                desc: 'Person → research → discovery → decision → impact. Navigate the topology of reasoning.',
              },
              {
                icon: MessagesSquare,
                title: 'Ask The Memory',
                desc: '“Why did you reject the lithium design?” — answered from the 2028 notes, in their voice.',
              },
              {
                icon: GitBranch,
                title: 'Thinking Style Model',
                desc: 'Learns writing voice, problem-solving approach and preferences to channel the person.',
              },
              {
                icon: Clock,
                title: 'Timeline Memory',
                desc: 'Every experiment, failure, discovery and publication plotted across the years.',
              },
            ].map((f) => (
              <Card key={f.title} className="border-border/60 transition-colors hover:border-amber-500/30">
                <CardContent className="p-6">
                  <f.icon className="h-6 w-6 text-amber-500" />
                  <h3 className="mt-4 font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── WHY MOONSHOT ───────────────────────── */}
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <Card className="relative overflow-hidden border-amber-500/20 bg-gradient-to-br from-amber-500/[0.06] via-transparent to-emerald-500/[0.06]">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl" />
            <CardContent className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.3fr_1fr] lg:items-center">
              <div>
                <Badge variant="outline" className="mb-4 gap-1.5 border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300">
                  <FlaskConical className="h-3 w-3" /> Why this is a moonshot
                </Badge>
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Current AI stores information.
                  <br />
                  Mnemosyne stores <span className="text-gradient-amber">how humans thought.</span>
                </h2>
                <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
                  Imagine an Einstein Memory. A Newton Memory. The memories of every scientist,
                  doctor, engineer and teacher who shaped our world — queryable, in their own voice,
                  by anyone who comes after. A collective intelligence network, built one preserved
                  mind at a time.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    'Originality',
                    'Technical depth',
                    'Civilization impact',
                    'Prototype-ready',
                  ].map((t) => (
                    <Badge key={t} variant="secondary" className="font-medium">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/60 p-6 backdrop-blur">
                <p className="text-sm italic leading-relaxed text-foreground/90">
                  &ldquo;Books preserved what humans knew. Mnemosyne preserves how humans
                  thought.&rdquo;
                </p>
                <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">
                  — The pitch
                </p>
                <div className="mt-6 border-t border-border/60 pt-5">
                  <Button onClick={exploreDemo} disabled={seeding} className="w-full gap-2">
                    <Brain className="h-4 w-4" />
                    {seeding ? 'Awakening…' : 'Converse with a preserved mind'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

// Animated "memory constellation" in the hero background.
// Pure SVG + CSS animations (no framer-motion) so server and client markup
// are identical — avoids any hydration mismatch.
function Constellation() {
  const seed = 42
  const pts = Array.from({ length: 34 }, (_, i) => {
    const r = Math.sin(seed + i * 12.9898) * 43758.5453
    const r2 = Math.sin(seed + i * 78.233) * 43758.5453
    // round to 2 decimals so server (Node V8) and client (browser V8) produce
    // bit-identical attribute strings (Math.sin of large args can differ in last ULP)
    const x = Math.round(((r - Math.floor(r)) * 100) * 100) / 100
    const y = Math.round(((r2 - Math.floor(r2)) * 100) * 100) / 100
    return { x, y }
  })
  return (
    <svg
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-[0.5]"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      {pts.map((p, i) => (
        <circle
          key={`d${i}`}
          cx={p.x}
          cy={p.y}
          r={0.12}
          fill="oklch(0.78 0.16 75)"
          style={{ animation: `mnemo-pulse-dot ${4 + (i % 5)}s ease-in-out ${i * 0.15}s infinite` }}
        />
      ))}
      {pts.slice(0, 18).map((p, i) => {
        const q = pts[(i + 3) % pts.length]
        return (
          <line
            key={`l${i}`}
            x1={p.x}
            y1={p.y}
            x2={q.x}
            y2={q.y}
            stroke="oklch(0.78 0.16 75)"
            strokeWidth={0.04}
            style={{ animation: `mnemo-pulse-line ${6 + (i % 4)}s ease-in-out ${i * 0.2}s infinite` }}
          />
        )
      })}
    </svg>
  )
}
