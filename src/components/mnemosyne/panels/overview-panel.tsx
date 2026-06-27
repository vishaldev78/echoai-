'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MessagesSquare, Network, Clock, Brain, Sparkles, ArrowRight, Loader2, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api, type Memory, type TimelineEvent, type ThinkingStyle, type Profile } from '@/lib/api'
import { typeColor } from '@/lib/api'
import { useApp } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { MemoryGraph } from '@/components/mnemosyne/memory-graph'
import { TimelineView } from '@/components/mnemosyne/timeline-view'

export function OverviewPanel({ profile }: { profile: Profile }) {
  const { setTab } = useApp()
  const { t } = useI18n()
  const [memories, setMemories] = useState<Memory[] | null>(null)
  const [events, setEvents] = useState<TimelineEvent[] | null>(null)
  const [graph, setGraph] = useState<{ nodes: any[]; edges: any[] } | null>(null)

  useEffect(() => {
    Promise.all([
      api.listMemories(profile.id),
      api.getTimeline(profile.id),
      api.getGraph(profile.id),
    ])
      .then(([m, ev, g]) => {
        setMemories(m.memories)
        setEvents(ev.events)
        setGraph(g)
      })
      .catch(() => {})
  }, [profile.id])

  const ts: ThinkingStyle | null = profile.thinkingStyle ?? null
  const featured = memories?.slice(0, 3) ?? []
  const recentEvents = events?.slice(-3).reverse() ?? []
  const lastName = profile.name.split(' ').slice(-1)[0]

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {/* Left: thinking style + featured memories */}
      <div className="space-y-5 lg:col-span-2">
        {ts && (
          <Card className="overflow-hidden border-amber-500/20 bg-gradient-to-br from-amber-500/[0.05] to-transparent">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300">
                <Brain className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.15em]">
                  {t('profile.fingerprint')}
                </span>
              </div>
              <p className="mt-3 text-base leading-relaxed">{ts.summary}</p>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                <FingerprintRow label={t('overview.fingerprint.writing')} value={ts.writingStyle} />
                <FingerprintRow label={t('overview.fingerprint.solving')} value={ts.problemSolving} />
                <FingerprintRow label={t('overview.fingerprint.prefs')} value={ts.preferences} />
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-amber-500" /> {t('overview.featured')}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setTab('memories')} className="gap-1 text-muted-foreground">
              {t('overview.all')} <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          {memories === null ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : featured.length === 0 ? (
            <EmptyMini
              text={t('overview.noMemories')}
              cta={t('overview.uploadKb')}
              onClick={() => setTab('upload')}
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              {featured.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card className="h-full border-border/60">
                    <CardContent className="flex h-full flex-col p-4">
                      <Badge variant="outline" className={`w-fit ${typeColor(m.type).border} ${typeColor(m.type).bg} ${typeColor(m.type).text}`}>
                        {m.type}
                      </Badge>
                      <p className="mt-2 line-clamp-1 text-sm font-medium">{m.title}</p>
                      <p className="mt-1 line-clamp-3 flex-1 text-xs leading-relaxed text-muted-foreground">
                        {m.content}
                      </p>
                      {m.year && (
                        <span className="mt-2 font-mono text-[10px] text-muted-foreground">{m.year}</span>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* mini graph */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Network className="h-4 w-4 text-amber-500" /> {t('overview.graphTitle')}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setTab('graph')} className="gap-1 text-muted-foreground">
              {t('overview.explore')} <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          <Card className="overflow-hidden border-border/60">
            <CardContent className="p-2">
              {graph ? (
                <MemoryGraph nodes={graph.nodes} edges={graph.edges} profileName={profile.name} />
              ) : (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right: CTA + recent timeline */}
      <div className="space-y-5">
        <Card className="overflow-hidden border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-emerald-500/10">
          <CardContent className="p-6 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-amber-500/15 ring-1 ring-amber-500/25">
              <MessagesSquare className="h-6 w-6 text-amber-500" />
            </span>
            <h3 className="mt-4 font-semibold">{t('overview.askTitle')}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {t('overview.askBody', { name: lastName })}
            </p>
            <Button onClick={() => setTab('chat')} className="mt-4 w-full gap-2">
              {t('overview.askCta')} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4 text-amber-500" /> {t('overview.recentTimeline')}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setTab('timeline')} className="gap-1 text-muted-foreground">
              {t('overview.all')} <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          {events === null ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : recentEvents.length === 0 ? (
            <EmptyMini text={t('overview.noTimeline')} />
          ) : (
            <TimelineView events={recentEvents} profileName={profile.name} />
          )}
        </div>

        {memories && memories.some((m) => m.type === 'quote') && (
          <Card className="border-emerald-500/20 bg-emerald-500/[0.03]">
            <CardContent className="p-5">
              <Quote className="h-5 w-5 text-emerald-500" />
              <p className="mt-3 text-sm italic leading-relaxed">
                {memories.find((m) => m.type === 'quote')?.content}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function FingerprintRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-background/50 p-3">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <p className="mt-1 text-xs leading-relaxed">{value}</p>
    </div>
  )
}

function EmptyMini({ text, cta, onClick }: { text: string; cta?: string; onClick?: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
      {text}
      {cta && (
        <Button variant="link" size="sm" onClick={onClick} className="ml-2">
          {cta}
        </Button>
      )}
    </div>
  )
}
