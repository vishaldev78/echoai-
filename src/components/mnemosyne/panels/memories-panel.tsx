'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Loader2, Search, Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api, type Memory, typeColor } from '@/lib/api'
import { useI18n } from '@/lib/i18n'

const TYPE_ORDER = [
  'fact',
  'decision',
  'discovery',
  'failure',
  'concept',
  'experiment',
  'quote',
  'principle',
]

export function MemoriesPanel({ profileId }: { profileId: string }) {
  const { t } = useI18n()
  const [memories, setMemories] = useState<Memory[] | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<string | null>(null)

  useEffect(() => {
    api.listMemories(profileId).then(({ memories }) => setMemories(memories)).catch(() => {})
  }, [profileId])

  const counts = useMemo(() => {
    const m: Record<string, number> = {}
    memories?.forEach((x) => (m[x.type] = (m[x.type] ?? 0) + 1))
    return m
  }, [memories])

  const filtered = useMemo(() => {
    if (!memories) return []
    const q = query.trim().toLowerCase()
    return memories.filter((m) => {
      if (filter && m.type !== filter) return false
      if (!q) return true
      return (
        m.title.toLowerCase().includes(q) ||
        m.content.toLowerCase().includes(q) ||
        m.keywords.toLowerCase().includes(q)
      )
    })
  }, [memories, query, filter])

  if (memories === null) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('memories.loading')}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Brain className="h-5 w-5 text-amber-500" /> {t('memories.title')}
            <Badge variant="secondary">{memories.length}</Badge>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('memories.subtitle')}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder={t('memories.search')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* type filter chips */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter(null)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            !filter
              ? 'border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-300'
              : 'border-border/60 text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('memories.all')} · {memories.length}
        </button>
        {TYPE_ORDER.filter((tp) => counts[tp]).map((tp) => (
          <button
            key={tp}
            onClick={() => setFilter(filter === tp ? null : tp)}
            className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${
              filter === tp
                ? `${typeColor(tp).border} ${typeColor(tp).bg} ${typeColor(tp).text}`
                : 'border-border/60 text-muted-foreground hover:text-foreground'
            }`}
          >
            {tp} · {counts[tp]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed border-border/60">
          <CardContent className="py-14 text-center text-sm text-muted-foreground">
            {t('memories.empty')}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m, i) => {
            const c = typeColor(m.type)
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.4) }}
              >
                <Card className={`h-full border ${c.border} ${c.bg}`}>
                  <CardContent className="flex h-full flex-col p-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`capitalize ${c.text} ${c.border} ${c.bg}`}>
                        {m.type}
                      </Badge>
                      {m.year && (
                        <span className="font-mono text-[11px] text-muted-foreground">{m.year}</span>
                      )}
                    </div>
                    {m.type === 'quote' ? (
                      <div className="mt-3 flex flex-1 gap-2">
                        <Quote className="h-4 w-4 shrink-0 text-emerald-500/60" />
                        <p className="text-sm italic leading-relaxed">{m.content}</p>
                      </div>
                    ) : (
                      <>
                        <p className="mt-2.5 text-sm font-semibold leading-snug">{m.title}</p>
                        <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground">
                          {m.content}
                        </p>
                      </>
                    )}
                    {m.keywords && (
                      <div className="mt-3 flex flex-wrap gap-1 border-t border-border/40 pt-2.5">
                        {m.keywords
                          .split(',')
                          .map((k) => k.trim())
                          .filter(Boolean)
                          .slice(0, 4)
                          .map((k) => (
                            <span
                              key={k}
                              className="rounded bg-background/60 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                            >
                              {k}
                            </span>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
