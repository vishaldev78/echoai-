'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, User, Cake, ArrowRight, Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useApp } from '@/lib/store'
import { api } from '@/lib/api'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'

export function LoginView() {
  const { setUser } = useApp()
  const { t } = useI18n()
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e?: React.FormEvent) {
    e?.preventDefault()
    const trimmed = name.trim()
    const ageNum = Number(age)
    if (!trimmed || !ageNum || ageNum < 1 || ageNum > 150) {
      toast.error(t('login.error'))
      return
    }
    setBusy(true)
    try {
      const { user } = await api.login({ name: trimmed, age: ageNum })
      setUser(user)
      toast.success(`${t('login.welcome')}, ${user.name}!`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('login.fail'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      {/* ambient background */}
      <div className="pointer-events-none absolute -top-1/3 left-1/2 h-[50vh] w-[50vh] -translate-x-1/2 rounded-full bg-fuchsia-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-[35vh] w-[35vh] rounded-full bg-emerald-500/12 blur-[120px]" />
      <div className="absolute inset-0 -z-10 bg-grid opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="relative mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500/25 to-emerald-500/25 ring-1 ring-fuchsia-500/40">
            <Brain className="h-8 w-8 text-fuchsia-500" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">{t('login.welcome')}</h1>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.3em] text-fuchsia-500/80">
            ECHO AI
          </p>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {t('login.subtitle')}
          </p>
        </div>

        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={submit} className="space-y-5">
              {/* name */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  {t('login.name')}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('login.namePh')}
                    disabled={busy}
                    autoComplete="name"
                    className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm outline-none transition-colors focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20"
                  />
                </div>
              </div>

              {/* age */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  {t('login.age')}
                </label>
                <div className="relative">
                  <Cake className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={150}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder={t('login.agePh')}
                    disabled={busy}
                    className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm outline-none transition-colors focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={busy}
                className="glow-brand h-12 w-full gap-2 bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 text-base font-semibold text-fuchsia-950 hover:from-fuchsia-400 hover:to-fuchsia-500"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> {t('login.submitting')}
                  </>
                ) : (
                  <>
                    {t('login.submit')} <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-border/50 bg-background/40 p-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <p className="text-xs leading-relaxed text-muted-foreground">{t('login.privacy')}</p>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs italic text-muted-foreground">{t('login.brand')}</p>
      </motion.div>
    </div>
  )
}
