import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { currentUserId } from '@/lib/auth'

async function ownedProfileId(profileId: string, ownerId: string) {
  const p = await db.profile.findFirst({ where: { id: profileId, ownerId }, select: { id: true } })
  return p?.id
}

export async function GET(req: NextRequest) {
  const profileId = req.nextUrl.searchParams.get('profileId')
  const ownerId = currentUserId(req)
  if (!profileId || !ownerId) return NextResponse.json({ nodes: [], edges: [] })
  const pid = await ownedProfileId(profileId, ownerId)
  if (!pid) return NextResponse.json({ nodes: [], edges: [] })
  const [nodes, edges] = await Promise.all([
    db.graphNode.findMany({ where: { profileId: pid } }),
    db.graphEdge.findMany({ where: { profileId: pid } }),
  ])
  return NextResponse.json({ nodes, edges })
}
