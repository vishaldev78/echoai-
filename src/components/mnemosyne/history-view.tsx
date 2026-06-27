'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MessagesSquare, Loader2, Clock, ArrowRight, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { useApp } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'

interface HistoryItem {
  id: string
  profileId: string
  profileName: string
  profileTitle: string
  profileField: string
  messageCount: number
  firstQuestion: string
  lastAnswer: string
  createdAt: string
}

export function HistoryView() {
  const { openProfile } = useApp()
  const { t, lang } = useI18n()
  const [items, setItems] = useState<HistoryItem[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .getHistory()
      .then(({ conversations }) => setItems(conversations))
      .catch(() => {
        toast.error(t('history.fail'))
        setItems([])
      })
      .finally(() => setLoading(false))
  }, [t])

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return lang === 'hi' ? 'अभी' : 'just now'
    if (mins < 60) return lang === 'hi' ? `${mins} मिनट पहले` : `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return lang === 'hi' ? `${hrs} घंटे पहले` : `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return lang === 'hi' ? `${days} दिन पहले` : `${days}d ago`
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('history.loading')}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-500/15 to-emerald-500/15 ring-1 ring-amber-500/20">
          <Clock className="h-5 w-5 text-amber-500" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t('history.title')}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{t('history.subtitle')}</p>
        </div>
      </div>

      {!items || items.length === 0 ? (
        <Card className="mt-8 border-dashed border-border/60">
          <CardContent className="flex flex-col items-center px-6 py-14 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-500/10 to-emerald-500/10 ring-1 ring-amber-500/15">
              <MessagesSquare className="h-6 w-6 text-muted-foreground" />
            </span>
            <h3 className="mt-4 text-base font-semibold">{t('history.empty.title')}</h3>
            <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{t('history.empty.body')}</p>
            <Button
              onClick={() => useApp.getState().goMemories()}
              className="mt-5 gap-2"
              variant="secondary"
            >
              {t('history.empty.cta')} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((item, i) => {
            const initials = item.profileName
              .split(' ')
              .map((s) => s[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
              >
                <Card
                  className="group cursor-pointer border-border/60 transition-all hover:border-amber-500/40 hover:shadow-md hover:shadow-amber-500/5"
                  onClick={() => openProfile(item.profileId, 'chat')}
                >
                  <CardContent className="flex items-start gap-3.5 p-4">
                    <Avatar className="h-10 w-10 shrink-0 ring-2 ring-amber-500/15">
                      <AvatarFallback className="bg-gradient-to-br from-amber-500/25 to-emerald-500/25 text-xs font-semibold text-amber-600 dark:text-amber-300">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{item.profileName}</p>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {timeAgo(item.createdAt)}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-start gap-1.5">
                        <span className="mt-0.5 text-[10px] font-semibold uppercase text-amber-500/70">
                          {lang === 'hi' ? 'आप' : 'You'}
                        </span>
                        <p className="line-clamp-1 text-sm text-foreground/90">{item.firstQuestion}</p>
                      </div>
                      {item.lastAnswer && (
                        <div className="mt-1 flex items-start gap-1.5">
                          <Brain className="mt-0.5 h-3 w-3 shrink-0 text-amber-500/70" />
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {item.lastAnswer}
                          </p>
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] font-normal">
                          {item.messageCount} {t('history.messages')}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{item.profileField}</span>
                        <span className="ml-auto flex items-center gap-1 text-[10px] font-medium text-amber-500 opacity-0 transition-opacity group-hover:opacity-100">
                          {t('history.continue')} <ArrowRight className="h-2.5 w-2.5" />
                        </span>
                      </div>
                    </div>
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
