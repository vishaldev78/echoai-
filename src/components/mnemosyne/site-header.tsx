'use client'

import { Brain, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/store'

export function SiteHeader() {
  const { goLanding, goProfiles, view } = useApp()
  const { setTheme } = useTheme()

  function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <button
          onClick={goLanding}
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

        <nav className="flex items-center gap-1 sm:gap-2">
          <Button
            variant={view === 'profiles' || view === 'profile' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={goProfiles}
            className="font-medium"
          >
            Memories
          </Button>
          {(
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              suppressHydrationWarning
            >
              <Sun className="hidden h-4 w-4 dark:block" />
              <Moon className="block h-4 w-4 dark:hidden" />
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
