// Typed client wrappers around the MNEMOSYNE API.

export interface Profile {
  id: string
  name: string
  title: string
  field: string
  bio: string
  birthYear: number | null
  deathYear: number | null
  avatarColor: string
  accent: string
  createdAt: string
  _count?: { memories: number; documents: number; timelineEvents: number; conversations?: number }
  thinkingStyle?: ThinkingStyle | null
}
export interface ThinkingStyle {
  writingStyle: string
  problemSolving: string
  preferences: string
  summary: string
}
export interface Document {
  id: string
  profileId: string
  title: string
  sourceType: string
  content: string
  charCount: number
  createdAt: string
}
export interface Memory {
  id: string
  type: string
  title: string
  content: string
  year: number | null
  keywords: string
}
export interface GraphNode {
  id: string
  label: string
  type: string
  memoryId?: string | null
}
export interface GraphEdge {
  id: string
  source: string
  target: string
  relationship: string
}
export interface TimelineEvent {
  id: string
  year: number
  title: string
  description: string
  type: string
}
export interface Message {
  id: string
  role: string
  content: string
  sources: string
  createdAt: string
}
export interface Conversation {
  id: string
  messages: Message[]
}

async function jfetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

export const api = {
  listProfiles: () => jfetch<{ profiles: Profile[] }>('/api/profiles'),
  createProfile: (data: Partial<Profile>) =>
    jfetch<{ profile: Profile }>('/api/profiles', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: (id: string) => jfetch<{ profile: Profile }>(`/api/profiles/${id}`),
  deleteProfile: (id: string) =>
    jfetch<{ ok: boolean }>(`/api/profiles/${id}`, { method: 'DELETE' }),

  listDocuments: (profileId: string) =>
    jfetch<{ documents: Document[] }>(`/api/documents?profileId=${profileId}`),
  uploadDocument: (data: { profileId: string; title: string; sourceType: string; content: string }) =>
    jfetch<{ document: Document; counts: Record<string, number> }>('/api/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  listMemories: (profileId: string) =>
    jfetch<{ memories: Memory[] }>(`/api/memories?profileId=${profileId}`),
  getGraph: (profileId: string) =>
    jfetch<{ nodes: GraphNode[]; edges: GraphEdge[] }>(`/api/graph?profileId=${profileId}`),
  getTimeline: (profileId: string) =>
    jfetch<{ events: TimelineEvent[] }>(`/api/timeline?profileId=${profileId}`),

  getConversation: (profileId: string) =>
    jfetch<{ conversation: Conversation | null }>(`/api/conversations?profileId=${profileId}`),
  chat: (data: { profileId: string; question: string; conversationId?: string }) =>
    jfetch<{ conversationId: string; answer: string; sources: { id: string; title: string; year?: number | null; type: string }[] }>(
      '/api/chat',
      { method: 'POST', body: JSON.stringify(data) },
    ),

  seed: () => jfetch<{ profile: Profile; seeded: boolean }>('/api/seed', { method: 'POST' }),

  // auth
  login: (data: { name: string; age: number }) =>
    jfetch<{ user: { id: string; name: string; age: number } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  logout: () => jfetch<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),

  // history
  getHistory: () =>
    jfetch<{
      conversations: {
        id: string
        profileId: string
        profileName: string
        profileTitle: string
        profileField: string
        messageCount: number
        firstQuestion: string
        lastAnswer: string
        createdAt: string
      }[]
    }>('/api/history'),
}

// Color tokens for memory types / node types — NO indigo or blue.
export const TYPE_COLORS: Record<string, { text: string; bg: string; border: string; dot: string }> = {
  fact: { text: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-500' },
  decision: { text: 'text-teal-700 dark:text-teal-300', bg: 'bg-teal-500/10', border: 'border-teal-500/30', dot: 'bg-teal-500' },
  discovery: { text: 'text-cyan-700 dark:text-cyan-300', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', dot: 'bg-cyan-500' },
  failure: { text: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-500/10', border: 'border-rose-500/30', dot: 'bg-rose-500' },
  concept: { text: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-500/10', border: 'border-violet-500/30', dot: 'bg-violet-500' },
  experiment: { text: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-500/10', border: 'border-orange-500/30', dot: 'bg-orange-500' },
  quote: { text: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-500' },
  principle: { text: 'text-fuchsia-700 dark:text-fuchsia-300', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30', dot: 'bg-fuchsia-500' },
  milestone: { text: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-500' },
  publication: { text: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-500/10', border: 'border-violet-500/30', dot: 'bg-violet-500' },
  default: { text: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/30', dot: 'bg-slate-500' },
}

export function typeColor(type: string) {
  return TYPE_COLORS[type] ?? TYPE_COLORS.default
}

export const SOURCE_LABELS: Record<string, string> = {
  pdf: 'PDF',
  txt: 'Text',
  md: 'Markdown',
  audio: 'Audio transcript',
  note: 'Note',
}
