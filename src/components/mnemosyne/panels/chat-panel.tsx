'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Brain, Loader2, Sparkles, FileText, Clock, Trash2, CornerDownLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { api, type Profile, type Conversation } from '@/lib/api'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'

interface UIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: { id: string; title: string; year?: number | null; type: string }[]
}

const SUGGESTION_KEYS = [
  'chat.suggest.1',
  'chat.suggest.2',
  'chat.suggest.3',
  'chat.suggest.4',
]

export function ChatPanel({ profile }: { profile: Profile }) {
  const { t } = useI18n()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const firstName = profile.name.split(' ').slice(-1)[0]
  const initials = profile.name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()

  useEffect(() => {
    setLoading(true)
    api
      .getConversation(profile.id)
      .then(({ conversation }) => {
        setConversation(conversation)
        if (conversation) {
          setMessages(
            conversation.messages.map((m, i) => ({
              id: m.id || `m${i}`,
              role: m.role as 'user' | 'assistant',
              content: m.content,
              sources:
                m.role === 'assistant' && m.sources
                  ? m.sources
                      .split(',')
                      .filter(Boolean)
                      .map((id, j) => ({ id, title: 'memory', type: 'fact', year: null }))
                  : undefined,
            })),
          )
        }
      })
      .finally(() => setLoading(false))
  }, [profile.id])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending])

  async function send(text?: string) {
    const question = (text ?? input).trim()
    if (!question || sending) return
    setInput('')
    const userMsg: UIMessage = { id: `u${Date.now()}`, role: 'user', content: question }
    setMessages((m) => [...m, userMsg])
    setSending(true)
    try {
      const res = await api.chat({
        profileId: profile.id,
        question,
        conversationId: conversation?.id,
      })
      setConversation({ id: res.conversationId, messages: [] } as Conversation)
      setMessages((m) => [
        ...m,
        {
          id: `a${Date.now()}`,
          role: 'assistant',
          content: res.answer,
          sources: res.sources,
        },
      ])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('chat.silent'))
      setMessages((m) => m.slice(0, -1))
    } finally {
      setSending(false)
    }
  }

  async function clearChat() {
    if (!conversation) return
    await fetch(`/api/conversations?profileId=${profile.id}`, { method: 'DELETE' })
    setConversation(null)
    setMessages([])
    toast.success(t('chat.cleared'))
  }

  return (
    <Card className="flex h-[72vh] flex-col overflow-hidden border-border/60">
      {/* header */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-9 w-9 ring-2 ring-amber-500/20">
            <AvatarFallback className="bg-gradient-to-br from-amber-500/25 to-emerald-500/25 text-xs font-semibold text-amber-600 dark:text-amber-300">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold leading-none">{profile.name}</p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-emerald-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {t('chat.active')}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearChat} className="gap-1.5 text-muted-foreground">
            <Trash2 className="h-3.5 w-3.5" /> {t('chat.clear')}
          </Button>
        )}
      </div>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-background/40 px-4 py-6">
        {loading ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('chat.loading')}
          </div>
        ) : messages.length === 0 ? (
          <Welcome name={firstName} field={profile.field} onPick={send} t={t} />
        ) : (
          <div className="mx-auto max-w-3xl space-y-5">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback
                      className={
                        m.role === 'user'
                          ? 'bg-secondary text-xs'
                          : 'bg-gradient-to-br from-amber-500/25 to-emerald-500/25 text-xs font-semibold text-amber-600 dark:text-amber-300'
                      }
                    >
                      {m.role === 'user' ? (t('nav.home') === 'Home' ? 'You' : 'आप') : initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`max-w-[80%] ${m.role === 'user' ? 'items-end' : ''}`}>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border/60 bg-card'
                      }`}
                    >
                      {m.content}
                    </div>
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {t('chat.grounded')}
                        </span>
                        {m.sources.map((s, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-600 dark:text-amber-300"
                          >
                            <Brain className="h-2.5 w-2.5" />
                            {s.title}
                            {s.year ? ` · ${s.year}` : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {sending && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-amber-500/25 to-emerald-500/25 text-xs font-semibold text-amber-600 dark:text-amber-300">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1.5 rounded-2xl border border-border/60 bg-card px-4 py-3.5">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-amber-500 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-amber-500 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-amber-500" />
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* input */}
      <div className="border-t border-border/60 p-3">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            rows={1}
            placeholder={t('chat.placeholder', { name: firstName })}
            className="max-h-32 flex-1 resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            disabled={sending}
          />
          <Button
            onClick={() => send()}
            disabled={sending || !input.trim()}
            size="icon"
            className="h-11 w-11 shrink-0 rounded-xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mx-auto mt-1.5 max-w-3xl text-center text-[10px] text-muted-foreground">
          {t('chat.disclaimer')} <CornerDownLeft className="inline h-2.5 w-2.5" /> {t('chat.toSend')}
        </p>
      </div>
    </Card>
  )
}

function Welcome({
  name,
  field,
  onPick,
  t,
}: {
  name: string
  field: string
  onPick: (q: string) => void
  t: (key: string, params?: Record<string, string | number>) => string
}) {
  const suggestions = SUGGESTION_KEYS.map((k) => t(k))
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center py-8 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-500/15 to-emerald-500/15 ring-1 ring-amber-500/25">
        <Brain className="h-7 w-7 text-amber-500" />
      </span>
      <h3 className="mt-4 text-lg font-semibold">{t('chat.welcome.title', { name })}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {t('chat.welcome.body', { field, name })}
      </p>
      <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
        {suggestions.map((q) => (
          <button
            key={q}
            onClick={() => onPick(q)}
            className="group flex items-center gap-2.5 rounded-xl border border-border/60 bg-background/50 px-3.5 py-3 text-left text-sm transition-all hover:border-amber-500/40 hover:bg-amber-500/[0.03]"
          >
            <Sparkles className="h-4 w-4 shrink-0 text-amber-500/70 group-hover:text-amber-500" />
            <span className="text-muted-foreground group-hover:text-foreground">{q}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
