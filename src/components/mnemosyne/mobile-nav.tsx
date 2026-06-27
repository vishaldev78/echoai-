'use client'

import { Home, Layers, Clock, Settings, Upload, Network, Brain, MessagesSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import { useApp, type ProfileTab } from '@/lib/store'
import { useI18n } from '@/lib/i18n'

/**
 * Mobile bottom navigation — Material 3 style with pill active indicators.
 * Fixed at the bottom on mobile only (`md:hidden`). Contextual:
 *  - splash / login: hidden entirely
 *  - profile detail: the 6 profile tabs
 *  - otherwise: Home, Memories, History, Settings
 */
export function MobileNav() {
  const { view, goHome, goMemories, goHistory, goSettings, selectedProfileId, activeTab, setTab } =
    useApp()
  const { t } = useI18n()

  // hide on splash + login
  if (view === 'splash' || view === 'login') return null

  // profile detail → 6 tabs
  if (view === 'profile' && selectedProfileId) {
    const tabs: { key: ProfileTab; icon: typeof Layers; label: string }[] = [
      { key: 'overview', icon: Layers, label: t('profile.tab.overview') },
      { key: 'memories', icon: Brain, label: t('profile.tab.memories') },
      { key: 'graph', icon: Network, label: t('profile.tab.graph') },
      { key: 'timeline', icon: Clock, label: t('profile.tab.timeline') },
      { key: 'chat', icon: MessagesSquare, label: t('profile.tab.ask') },
      { key: 'upload', icon: Upload, label: t('profile.tab.upload') },
    ]
    return (
      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-stretch border-t border-border/60 bg-background pb-safe md:hidden"
        aria-label={t('nav.profile')}
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setTab(tab.key)}
              className={`press flex flex-1 flex-col items-center justify-center gap-1 ${
                active ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
              }`}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
            >
              <span className="relative grid h-8 w-16 place-items-center">
                {active && (
                  <motion.span
                    layoutId="m3-nav-pill"
                    className="absolute inset-0 rounded-full bg-amber-500/15"
                    transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                  />
                )}
                <tab.icon
                  className={`relative h-[22px] w-[22px] ${active ? 'stroke-[2.2]' : 'stroke-[1.8]'}`}
                />
              </span>
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </button>
          )
        })}
      </nav>
    )
  }

  // global nav
  const items = [
    { icon: Home, label: t('nav.home'), active: view === 'home', onClick: goHome },
    { icon: Layers, label: t('nav.memories'), active: view === 'memories', onClick: goMemories },
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
              active ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
            }`}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
          >
            <span className="relative grid h-8 w-16 place-items-center">
              {active && (
                <motion.span
                  layoutId="m3-nav-pill"
                  className="absolute inset-0 rounded-full bg-amber-500/15"
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
