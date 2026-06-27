'use client'

import { create } from 'zustand'

export type View = 'landing' | 'profiles' | 'profile'
export type ProfileTab = 'overview' | 'upload' | 'memories' | 'graph' | 'timeline' | 'chat'

interface AppState {
  view: View
  selectedProfileId: string | null
  activeTab: ProfileTab
  // navigation
  goLanding: () => void
  goProfiles: () => void
  openProfile: (id: string, tab?: ProfileTab) => void
  setTab: (tab: ProfileTab) => void
}

export const useApp = create<AppState>((set) => ({
  view: 'landing',
  selectedProfileId: null,
  activeTab: 'overview',
  goLanding: () => set({ view: 'landing' }),
  goProfiles: () => set({ view: 'profiles' }),
  openProfile: (id, tab = 'overview') =>
    set({ view: 'profile', selectedProfileId: id, activeTab: tab }),
  setTab: (tab) => set({ activeTab: tab }),
}))
