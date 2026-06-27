'use client'

import { Brain, ArrowLeft } from 'lucide-react'
import { useApp } from '@/lib/store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export function SiteHeader() {
  const { goHome, goMemories, goSettings, view, user } = useApp()

  // hide header on splash + login
  if (view === 'splash' || view === 'login') return null

  const showBack = view === 'profile'

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          {showBack ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={goMemories}
              className="-ml-2 gap-1.5 text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{/* back */}</span>
            </Button>
          ) : null}
          <button
            onClick={goHome}
            className="group flex items-center gap-2.5"
            aria-label="Mnemosyne AI home"
          >
            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 ring-1 ring-amber-500/30">
              <Brain className="h-5 w-5 text-amber-500" />
              <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5" />
            </span>
            <span className="flex flex-col items-start leading-none">
              <span className="text-[15px] font-semibold tracking-tight">MNEMOSYNE</span>
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-amber-500/80">
                AI
              </span>
            </span>
          </button>
        </div>

        <nav className="flex items-center gap-1 sm:gap-2">
          {/* desktop nav — mobile uses bottom nav */}
          <Button
            variant={view === 'home' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={goHome}
            className="hidden font-medium md:inline-flex"
          >
            Home
          </Button>
          <Button
            variant={view === 'memories' || view === 'profile' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={goMemories}
            className="hidden font-medium md:inline-flex"
          >
            Memories
          </Button>

          {/* user avatar → settings */}
          <button
            onClick={goSettings}
            className="flex items-center gap-2 rounded-full p-1 pr-3 transition-colors hover:bg-accent"
            aria-label="Settings"
          >
            <Avatar className="h-8 w-8 ring-2 ring-amber-500/20">
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
