'use client'

import { SiteHeader } from '@/components/mnemosyne/site-header'
import { SiteFooter } from '@/components/mnemosyne/site-footer'
import { Landing } from '@/components/mnemosyne/landing'
import { ProfilesView } from '@/components/mnemosyne/profiles-view'
import { ProfileDetail } from '@/components/mnemosyne/profile-detail'
import { useApp } from '@/lib/store'
import { useEffect } from 'react'

export default function Home() {
  const { view, selectedProfileId } = useApp()

  // scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [view, selectedProfileId])

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {view === 'landing' && <Landing />}
        {view === 'profiles' && <ProfilesView />}
        {view === 'profile' && selectedProfileId && (
          <ProfileDetail key={selectedProfileId} profileId={selectedProfileId} />
        )}
      </main>
      <SiteFooter />
    </>
  )
}
