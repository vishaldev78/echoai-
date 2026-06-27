'use client'

import { Home, Layers, Clock, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import { useApp } from '@/lib/store'
import { useI18n } from '@/lib/i18n'

/**
 * Mobile bottom navigation — Material 3 style with pill active indicators.
 * Fixed at the bottom on mobile only (`md:hidden`).
 * Always shows the 4 top-level destinations: Home, Memories, History, Settings.
 * Profile sub-navigation (Overview/Graph/Timeline/Ask/Upload/Memories) lives
 * in a sticky scrollable top tab strip inside the profile detail — the
 * industry-standard pattern for sub-navigation (used by YouTube, Chrome, etc.)
 */
export function MobileNav() {
  const { view, goHome, goMemories, goHistory, goSettings } = useApp()
  const { t } = useI18n()

  // hide on splash + login
  if (view === 'splash' || view === 'login') return null

  const items = [
    { icon: Home, label: t('nav.home'), active: view === 'home', onClick: goHome },
    { icon: Layers, label: t('nav.memories'), active: view === 'memories' || view === 'profile', onClick: goMemories },
    { icon: Clock, label: t('nav.history'), active: view === 'history', onClick: goHistory },
    { icon: Settings, label: t('nav.settings'), active: view === 'settings', onClick: goSettings },
  ]

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-stretch border-t border-border/60 bg-background pb-safe md:hidden"
      aria-label={t('nav.home')}
    >
      {items.map((item) => {
        const active = item.active
        return (
          <button
            key={item.label}
            onClick={item.onClick}
            className={`press flex flex-1 flex-col items-center justify-center gap-1 ${
              active ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
            }`}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
          >
            <span className="relative grid h-8 w-16 place-items-center">
              {active && (
                <motion.span
                  layoutId="m3-nav-pill"
                  className="absolute inset-0 rounded-full bg-emerald-500/15"
                  transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                />
              )}
              <item.icon
                className={`relative h-[22px] w-[22px] ${active ? 'stroke-[2.2]' : 'stroke-[1.8]'}`}
              />
            </span>
            <span className="text-[10px] font-medium leading-none">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
