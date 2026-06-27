'use client'

import { Home, Layers, Clock, Settings, Upload, Network, Brain, MessagesSquare } from 'lucide-react'
import { useApp, type ProfileTab } from '@/lib/store'
import { useI18n } from '@/lib/i18n'

/**
 * Mobile bottom navigation — fixed at the bottom on mobile only (`md:hidden`).
 * Contextual:
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
        className="fixed inset-x-0 bottom-0 z-50 flex items-stretch border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-label={t('nav.profile')}
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setTab(tab.key)}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                active ? 'text-amber-500' : 'text-muted-foreground'
              }`}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
            >
              <tab.icon className={`h-[18px] w-[18px] ${active ? 'stroke-[2.2]' : ''}`} />
              <span className="text-[9px] font-medium leading-none">{tab.label}</span>
              {active && <span className="mt-0.5 h-0.5 w-5 rounded-full bg-amber-500" />}
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
      className="fixed inset-x-0 bottom-0 z-50 flex items-stretch border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label={t('nav.home')}
    >
      {items.map((item) => (
        <button
          key={item.label}
          onClick={item.onClick}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${
            item.active ? 'text-amber-500' : 'text-muted-foreground'
          }`}
          aria-label={item.label}
          aria-current={item.active ? 'page' : undefined}
        >
          <item.icon className="h-[18px] w-[18px]" />
          <span className="text-[9px] font-medium leading-none">{item.label}</span>
          {item.active && <span className="mt-0.5 h-0.5 w-5 rounded-full bg-amber-500" />}
        </button>
      ))}
    </nav>
  )
}
