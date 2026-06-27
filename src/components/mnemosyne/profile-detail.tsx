'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Loader2, Network, Upload, MessagesSquare, Clock, Layers, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { api, type Profile } from '@/lib/api'
import { useApp, type ProfileTab } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'
import { OverviewPanel } from './panels/overview-panel'
import { UploadPanel } from './panels/upload-panel'
import { MemoriesPanel } from './panels/memories-panel'
import { GraphPanel } from './panels/graph-panel'
import { TimelinePanel } from './panels/timeline-panel'
import { ChatPanel } from './panels/chat-panel'

export function ProfileDetail({ profileId }: { profileId: string }) {
  const { goProfiles, activeTab, setTab } = useApp()
  const { t } = useI18n()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    api
      .getProfile(profileId)
      .then(({ profile }) => active && setProfile(profile))
      .catch((e) => toast.error(e instanceof Error ? e.message : t('toast.loadFail')))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [profileId, t])

  const reload = () =>
    api.getProfile(profileId).then(({ profile }) => setProfile(profile))

  if (loading || !profile) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('profile.loading')}
      </div>
    )
  }

  const initials = profile.name
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const counts = profile._count

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Button variant="ghost" size="sm" onClick={goProfiles} className="mb-5 gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> {t('profile.back')}
      </Button>

      {/* header */}
      <Card className="relative overflow-hidden border-border/60">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-cyan-500" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />
        <CardContent className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <Avatar className="h-20 w-20 ring-4 ring-amber-500/15">
            <AvatarFallback className="bg-gradient-to-br from-amber-500/25 to-emerald-500/25 text-xl font-semibold text-amber-600 dark:text-amber-300">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{profile.name}</h1>
              {profile.birthYear && (
                <Badge variant="outline" className="font-mono text-xs">
                  {profile.birthYear}
                  {profile.deathYear ? `–${profile.deathYear}` : '–'}
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-sm text-amber-600 dark:text-amber-300">
              {profile.title} · {profile.field}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {profile.bio}
            </p>
            {profile.thinkingStyle && (
              <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/[0.04] px-3 py-2.5">
                <Brain className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  <span className="font-medium text-foreground">{t('profile.fingerprint')} — </span>
                  {profile.thinkingStyle.summary}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 lg:grid-cols-1 lg:gap-2">
            <HeaderStat icon={Layers} value={counts?.memories ?? 0} label={t('profile.stat.memories')} />
            <HeaderStat icon={Network} value={counts?.documents ?? 0} label={t('profile.stat.documents')} />
            <HeaderStat icon={Clock} value={counts?.timelineEvents ?? 0} label={t('profile.stat.events')} />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setTab(v as ProfileTab)} className="mt-6">
        {/* desktop tab strip — hidden on mobile (bottom nav handles it) */}
        <div className="hidden overflow-x-auto md:block">
          <TabsList className="h-auto w-max bg-background p-1">
            <TabsTrigger value="overview" className="gap-1.5">
              <Layers className="h-3.5 w-3.5" /> {t('profile.tab.overview')}
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-1.5">
              <Upload className="h-3.5 w-3.5" /> {t('profile.tab.upload')}
            </TabsTrigger>
            <TabsTrigger value="memories" className="gap-1.5">
              <Brain className="h-3.5 w-3.5" /> {t('profile.tab.memories')}
            </TabsTrigger>
            <TabsTrigger value="graph" className="gap-1.5">
              <Network className="h-3.5 w-3.5" /> {t('profile.tab.graph')}
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {t('profile.tab.timeline')}
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-1.5">
              <MessagesSquare className="h-3.5 w-3.5" /> {t('profile.tab.ask')}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-6">
          <OverviewPanel profile={profile} />
        </TabsContent>
        <TabsContent value="upload" className="mt-6">
          <UploadPanel profile={profile} onUploaded={() => { reload(); setTab('memories') }} />
        </TabsContent>
        <TabsContent value="memories" className="mt-6">
          <MemoriesPanel profileId={profile.id} />
        </TabsContent>
        <TabsContent value="graph" className="mt-6">
          <GraphPanel profileId={profile.id} profileName={profile.name} />
        </TabsContent>
        <TabsContent value="timeline" className="mt-6">
          <TimelinePanel profileId={profile.id} profileName={profile.name} />
        </TabsContent>
        <TabsContent value="chat" className="mt-6">
          <ChatPanel profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function HeaderStat({ icon: Icon, value, label }: { icon: typeof Layers; value: number; label: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-background/60 px-3 py-2">
      <Icon className="h-4 w-4 text-amber-500" />
      <div className="leading-none">
        <div className="text-base font-semibold tabular-nums">{value}</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}
