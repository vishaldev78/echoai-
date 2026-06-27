'use client'

import { Brain, ArrowLeft } from 'lucide-react'
import { useApp } from '@/lib/store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'

export function SiteHeader() {
  const { goHome, goMemories, goSettings, view, user, selectedProfileId } = useApp()
  const { t } = useI18n()

  // hide header on splash + login
  if (view === 'splash' || view === 'login') return null

  const showBack = view === 'profile'

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background pt-safe">
      {/* Material-style compact app bar — 56px (h-14), opaque */}
      <div className="flex h-14 items-center justify-between px-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-1">
          {showBack ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={goMemories}
              className="press h-10 w-10 shrink-0 text-foreground"
              aria-label={t('profile.back')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : null}

          {/* contextual title */}
          {showBack ? (
            <button
              onClick={goMemories}
              className="press min-w-0 flex-1 text-left"
              aria-label={t('profile.back')}
            >
              <span className="block truncate text-base font-semibold leading-tight">
                {t('profile.back')}
              </span>
            </button>
          ) : (
            <button
              onClick={goHome}
              className="press flex items-center gap-2.5"
              aria-label="Mnemosyne AI home"
            >
              <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-amber-500/20 to-emerald-500/20 ring-1 ring-amber-500/30">
                <Brain className="h-[18px] w-[18px] text-amber-500" />
              </span>
              <span className="flex flex-col items-start leading-none">
                <span className="text-[15px] font-semibold tracking-tight">MNEMOSYNE</span>
                <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-amber-500/80">
                  AI
                </span>
              </span>
            </button>
          )}
        </div>

        <nav className="flex items-center gap-1">
          {/* desktop nav — mobile uses bottom nav */}
          <Button
            variant={view === 'home' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={goHome}
            className="press hidden font-medium md:inline-flex"
          >
            {t('nav.home')}
          </Button>
          <Button
            variant={view === 'memories' || view === 'profile' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={goMemories}
            className="press hidden font-medium md:inline-flex"
          >
            {t('nav.memories')}
          </Button>

          {/* user avatar → settings */}
          <button
            onClick={goSettings}
            className="press flex items-center gap-2 rounded-full p-1 pr-1 sm:pr-3"
            aria-label={t('nav.settings')}
          >
            <Avatar className="h-9 w-9 ring-2 ring-amber-500/20">
              <AvatarFallback className="bg-gradient-to-br from-amber-500/25 to-emerald-500/25 text-[11px] font-semibold text-amber-600 dark:text-amber-300">
                {(user?.name || '?')
                  .split(' ')
                  .map((s) => s[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[120px] truncate text-sm font-medium sm:inline">
              {user?.name}
            </span>
          </button>
        </nav>
      </div>
    </header>
  )
}
