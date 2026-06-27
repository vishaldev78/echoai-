'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SiteHeader } from '@/components/mnemosyne/site-header'
import { SiteFooter } from '@/components/mnemosyne/site-footer'
import { MobileNav } from '@/components/mnemosyne/mobile-nav'
import { Landing } from '@/components/mnemosyne/landing'
import { ProfilesView } from '@/components/mnemosyne/profiles-view'
import { ProfileDetail } from '@/components/mnemosyne/profile-detail'
import { SplashScreen } from '@/components/mnemosyne/splash-screen'
import { LoginView } from '@/components/mnemosyne/login-view'
import { SettingsView } from '@/components/mnemosyne/settings-view'
import { HistoryView } from '@/components/mnemosyne/history-view'
import { useApp, hydrateUser } from '@/lib/store'

export default function Home() {
  const { view, selectedProfileId } = useApp()

  // On first client mount: show splash briefly, then hydrate the user.
  useEffect(() => {
    const timer = setTimeout(() => hydrateUser(), 2200)
    return () => clearTimeout(timer)
  }, [])

  // scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [view, selectedProfileId])

  // splash + login are full-screen (no header/footer/nav)
  if (view === 'splash') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <SplashScreen />
        </motion.div>
      </AnimatePresence>
    )
  }
  if (view === 'login') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
        >
          <LoginView />
        </motion.div>
      </AnimatePresence>
    )
  }

  // app shell with app-like page transitions (fade + subtle slide)
  return (
    <>
      <SiteHeader />
      <main className="flex-1 pb-16 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={view === 'profile' ? `profile-${selectedProfileId}` : view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
          >
            {view === 'home' && <Landing />}
            {view === 'memories' && <ProfilesView />}
            {view === 'history' && <HistoryView />}
            {view === 'settings' && <SettingsView />}
            {view === 'profile' && selectedProfileId && (
              <ProfileDetail profileId={selectedProfileId} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      <SiteFooter />
      <MobileNav />
    </>
  )
}
