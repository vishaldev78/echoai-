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
import { useI18n } from '@/lib/i18n'
import { useState } from 'react'
import { toast } from 'sonner'

export function Landing() {
  const { goProfiles, openProfile } = useApp()
  const { t } = useI18n()
  const [seeding, setSeeding] = useState(false)

  async function exploreDemo() {
    setSeeding(true)
    const tid = toast.loading(t('toast.demo.loading'))
    try {
      const { profile } = await api.seed()
      toast.success(t('toast.demo.ready'), { id: tid })
      openProfile(profile.id, 'overview')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('toast.demo.fail'), { id: tid })
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
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-500/[0.07] via-transparent to-transparent" />
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[120px]" />
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
              className="mb-6 gap-2 border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-600 dark:text-emerald-300"
            >
              <Sparkles className="h-3 w-3" />
              {t('landing.badge')}
            </Badge>

            <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              {t('landing.title1')}
              <br />
              <span className="text-gradient-brand">{t('landing.title2')}</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t('landing.subtitle')}
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={exploreDemo}
                disabled={seeding}
                className="glow-brand h-12 gap-2 bg-gradient-to-br from-emerald-500 to-emerald-600 px-7 text-base font-semibold text-emerald-950 hover:from-emerald-400 hover:to-emerald-500"
              >
                <Brain className="h-5 w-5" />
                {seeding ? t('landing.cta.demoLoading') : t('landing.cta.demo')}
                {!seeding && <ArrowRight className="h-4 w-4" />}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={goProfiles}
                className="h-12 gap-2 px-7 text-base"
              >
                <Upload className="h-4 w-4" />
                {t('landing.cta.preserve')}
              </Button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">{t('landing.signup')}</p>
          </motion.div>

          {/* stat strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 sm:grid-cols-4"
          >
            {[
              { k: t('landing.stat.knowledge'), v: t('landing.stat.extracted') },
              { k: t('landing.stat.reasoning'), v: t('landing.stat.preserved') },
              { k: t('landing.stat.failures'), v: t('landing.stat.firstClass') },
              { k: t('landing.stat.answers'), v: t('landing.stat.grounded') },
            ].map((s) => (
              <div key={s.k} className="bg-background/80 px-4 py-5 text-center backdrop-blur">
                <div className="text-lg font-semibold text-emerald-500">{s.v}</div>
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
                {t('landing.problem.label')}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                {t('landing.problem.title1')}
                <br />
                {t('landing.problem.title2')}
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                {t('landing.problem.body')}
              </p>
              <div className="mt-6 space-y-2.5">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="flex items-center gap-3 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    <span className="text-muted-foreground">{t(`landing.problem.${n}`)}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="relative overflow-hidden border-rose-500/20 bg-rose-500/[0.03]">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2 text-sm font-medium text-rose-500">
                  <Quote className="h-4 w-4" /> {t('landing.problem.survives')}
                </div>
                <div className="space-y-3">
                  {[
                    { icon: FileText, label: 'Research_Paper.pdf', note: t('landing.problem.theWhat') },
                    { icon: BookOpen, label: 'Experiment_Log.md', note: t('landing.problem.theResult') },
                    { icon: Code2, label: 'repository.git', note: t('landing.problem.theHow') },
                    { icon: AudioLines, label: 'interview.mp3', note: t('landing.problem.theAnecdote') },
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
                    {t('landing.problem.whyGone')}
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
              {t('landing.solution.label')}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {t('landing.solution.title')}
            </h2>
            <p className="mt-4 text-muted-foreground">{t('landing.solution.body')}</p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-4">
            {[
              { icon: Upload, step: '01', titleKey: 'landing.solution.1.title', descKey: 'landing.solution.1.desc' },
              { icon: Sparkles, step: '02', titleKey: 'landing.solution.2.title', descKey: 'landing.solution.2.desc' },
              { icon: Network, step: '03', titleKey: 'landing.solution.3.title', descKey: 'landing.solution.3.desc' },
              { icon: MessagesSquare, step: '04', titleKey: 'landing.solution.4.title', descKey: 'landing.solution.4.desc' },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Card className="group h-full border-border/60 transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/[0.03]">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="flex items-center justify-between">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/15 ring-1 ring-emerald-500/20 transition-transform group-hover:scale-105">
                        <s.icon className="h-5 w-5 text-emerald-500" />
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">{s.step}</span>
                    </div>
                    <h3 className="mt-4 text-base font-semibold">{t(s.titleKey)}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t(s.descKey)}</p>
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">
              {t('landing.features.label')}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {t('landing.features.title')}
            </h2>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Upload, titleKey: 'landing.features.1.title', descKey: 'landing.features.1.desc' },
              { icon: Sparkles, titleKey: 'landing.features.2.title', descKey: 'landing.features.2.desc' },
              { icon: Network, titleKey: 'landing.features.3.title', descKey: 'landing.features.3.desc' },
              { icon: MessagesSquare, titleKey: 'landing.features.4.title', descKey: 'landing.features.4.desc' },
              { icon: GitBranch, titleKey: 'landing.features.5.title', descKey: 'landing.features.5.desc' },
              { icon: Clock, titleKey: 'landing.features.6.title', descKey: 'landing.features.6.desc' },
            ].map((f) => (
              <Card key={f.titleKey} className="border-border/60 transition-colors hover:border-emerald-500/30">
                <CardContent className="p-6">
                  <f.icon className="h-6 w-6 text-emerald-500" />
                  <h3 className="mt-4 font-semibold">{t(f.titleKey)}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t(f.descKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── WHY MOONSHOT ───────────────────────── */}
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-emerald-500/[0.06]">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
            <CardContent className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.3fr_1fr] lg:items-center">
              <div>
                <Badge variant="outline" className="mb-4 gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                  <FlaskConical className="h-3 w-3" /> {t('landing.moonshot.label')}
                </Badge>
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  {t('landing.moonshot.title1')}
                  <br />
                  {t('landing.moonshot.title2')}
                </h2>
                <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
                  {t('landing.moonshot.body')}
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/60 p-6 backdrop-blur">
                <p className="text-sm italic leading-relaxed text-foreground/90">
                  {t('landing.moonshot.quote')}
                </p>
                <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">
                  {t('landing.moonshot.pitch')}
                </p>
                <div className="mt-6 border-t border-border/60 pt-5">
                  <Button onClick={exploreDemo} disabled={seeding} className="w-full gap-2">
                    <Brain className="h-4 w-4" />
                    {seeding ? t('landing.cta.demoLoading') : t('landing.moonshot.cta')}
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
// are identical — avoids any hydration mismatch. Coords rounded to 2 decimals
// so Math.sin produces bit-identical values on Node vs browser V8.
function Constellation() {
  const seed = 42
  const pts = Array.from({ length: 34 }, (_, i) => {
    const r = Math.sin(seed + i * 12.9898) * 43758.5453
    const r2 = Math.sin(seed + i * 78.233) * 43758.5453
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
          fill="oklch(0.7 0.16 160)"
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
            stroke="oklch(0.7 0.16 160)"
            strokeWidth={0.04}
            style={{ animation: `mnemo-pulse-line ${6 + (i % 4)}s ease-in-out ${i * 0.2}s infinite` }}
          />
        )
      })}
    </svg>
  )
}
