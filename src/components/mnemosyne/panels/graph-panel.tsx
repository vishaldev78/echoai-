'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { api } from '@/lib/api'
import { MemoryGraph } from '@/components/mnemosyne/memory-graph'

export function GraphPanel({ profileId, profileName }: { profileId: string; profileName: string }) {
  const [graph, setGraph] = useState<{ nodes: any[]; edges: any[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .getGraph(profileId)
      .then(setGraph)
      .finally(() => setLoading(false))
  }, [profileId])

  return (
    <Card className="overflow-hidden border-border/60">
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Knowledge graph</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            How {profileName.split(' ').slice(-1)[0]}&apos;s ideas, experiments, decisions and
            outcomes connect. Hover a node for detail; hover an edge for the relationship.
          </p>
        </div>
        {loading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Weaving the graph…
          </div>
        ) : (
          <MemoryGraph nodes={graph?.nodes ?? []} edges={graph?.edges ?? []} profileName={profileName} />
        )}
      </CardContent>
    </Card>
  )
}
