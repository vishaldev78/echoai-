'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { api } from '@/lib/api'
import { useI18n } from '@/lib/i18n'
import { TimelineView } from '@/components/mnemosyne/timeline-view'

export function TimelinePanel({ profileId, profileName }: { profileId: string; profileName: string }) {
  const { t } = useI18n()
  const [events, setEvents] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .getTimeline(profileId)
      .then(({ events }) => setEvents(events))
      .finally(() => setLoading(false))
  }, [profileId])

  return (
    <Card className="border-border/60">
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">{t('timeline.title')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('timeline.subtitle', { name: profileName })}
          </p>
        </div>
        {loading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('timeline.loading')}
          </div>
        ) : (
          <TimelineView events={events ?? []} profileName={profileName} />
        )}
      </CardContent>
    </Card>
  )
}
