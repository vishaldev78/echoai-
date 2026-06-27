'use client'

import { useEffect } from 'react'
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [view, selectedProfileId])

  // splash + login are full-screen (no header/footer/nav)
  if (view === 'splash') {
    return <SplashScreen />
  }
  if (view === 'login') {
    return <LoginView />
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {view === 'home' && <Landing />}
        {view === 'memories' && <ProfilesView />}
        {view === 'history' && <HistoryView />}
        {view === 'settings' && <SettingsView />}
        {view === 'profile' && selectedProfileId && (
          <ProfileDetail key={selectedProfileId} profileId={selectedProfileId} />
        )}
      </main>
      <SiteFooter />
      <MobileNav />
    </>
  )
}
