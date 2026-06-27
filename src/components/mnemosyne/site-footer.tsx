'use client'

import { Brain } from 'lucide-react'
import { useApp } from '@/lib/store'
import { useI18n } from '@/lib/i18n'

export function SiteFooter() {
  const { goHome, goMemories } = useApp()
  const { t } = useI18n()
  return (
    <footer className="mt-auto border-t border-border/60 bg-background/60 pb-16 md:pb-0">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-5 sm:flex-row sm:justify-between sm:px-6">
        <button
          onClick={goHome}
          className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-emerald-500/20 to-emerald-500/20 ring-1 ring-emerald-500/30">
            <Brain className="h-3.5 w-3.5 text-emerald-500" />
          </span>
          <span className="text-xs font-semibold">ECHO AI</span>
        </button>

        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
          <button onClick={goHome} className="hover:text-foreground transition-colors">
            {t('nav.vision')}
          </button>
          <button onClick={goMemories} className="hover:text-foreground transition-colors">
            {t('nav.memories')}
          </button>
        </div>

        <p className="text-[10px] text-muted-foreground/70">
          {t('footer.built')}
        </p>
      </div>
    </footer>
  )
}
