'use client'

import { Brain, Github } from 'lucide-react'
import { useApp } from '@/lib/store'
import { useI18n } from '@/lib/i18n'

export function SiteFooter() {
  const { goLanding, goProfiles } = useApp()
  const { t } = useI18n()
  return (
    <footer className="mt-auto border-t border-border/60 bg-background/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 ring-1 ring-amber-500/30">
            <Brain className="h-5 w-5 text-amber-500" />
          </span>
          <div>
            <p className="text-sm font-semibold">Mnemosyne AI</p>
            <p className="mt-0.5 max-w-md text-xs leading-relaxed text-muted-foreground">
              {t('footer.tagline')}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 text-xs text-muted-foreground md:items-end">
          <div className="flex items-center gap-4">
            <button onClick={goLanding} className="hover:text-foreground transition-colors">
              {t('nav.vision')}
            </button>
            <button onClick={goProfiles} className="hover:text-foreground transition-colors">
              {t('nav.memories')}
            </button>
            <a
              href="#"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <Github className="h-3.5 w-3.5" /> Source
            </a>
          </div>
          <p className="flex items-center gap-1.5">
            {t('footer.built')}
          </p>
        </div>
      </div>
    </footer>
  )
}
