'use client'

import { create } from 'zustand'

export type View =
  | 'splash'
  | 'login'
  | 'home'
  | 'memories'
  | 'profile'
  | 'history'
  | 'settings'
export type ProfileTab = 'overview' | 'upload' | 'memories' | 'graph' | 'timeline' | 'chat'

export interface AppUser {
  id: string
  name: string
  age: number
}

interface AppState {
  view: View
  selectedProfileId: string | null
  activeTab: ProfileTab
  user: AppUser | null
  // navigation
  goLanding: () => void // alias → home
  goProfiles: () => void // alias → memories
  goHome: () => void
  goMemories: () => void
  goHistory: () => void
  goSettings: () => void
  goLogin: () => void
  openProfile: (id: string, tab?: ProfileTab) => void
  setTab: (tab: ProfileTab) => void
  // auth
  setUser: (u: AppUser) => void
  logout: () => void
}

const USER_KEY = 'echo-user'

function loadUser(): AppUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AppUser) : null
  } catch {
    return null
  }
}

export const useApp = create<AppState>((set) => ({
  view: 'splash',
  selectedProfileId: null,
  activeTab: 'overview',
  user: null, // hydrated client-side by page.tsx
  goLanding: () => set({ view: 'home' }),
  goProfiles: () => set({ view: 'memories' }),
  goHome: () => set({ view: 'home' }),
  goMemories: () => set({ view: 'memories' }),
  goHistory: () => set({ view: 'history' }),
  goSettings: () => set({ view: 'settings' }),
  goLogin: () => set({ view: 'login' }),
  openProfile: (id, tab = 'overview') =>
    set({ view: 'profile', selectedProfileId: id, activeTab: tab }),
  setTab: (tab) => set({ activeTab: tab }),
  setUser: (u) => {
    if (typeof window !== 'undefined') window.localStorage.setItem(USER_KEY, JSON.stringify(u))
    set({ user: u, view: 'home' })
  },
  logout: () => {
    if (typeof window !== 'undefined') window.localStorage.removeItem(USER_KEY)
    set({ user: null, view: 'login', selectedProfileId: null, activeTab: 'overview' })
  },
}))

/** Hydrate the persisted user from localStorage (call once on the client). */
export function hydrateUser() {
  const u = loadUser()
  if (u) useApp.setState({ user: u, view: 'home' })
  else useApp.setState({ view: 'login' })
}
