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
  if (!profileId || !ownerId) return NextResponse.json({ events: [] })
  const pid = await ownedProfileId(profileId, ownerId)
  if (!pid) return NextResponse.json({ events: [] })
  const events = await db.timelineEvent.findMany({
    where: { profileId: pid },
    orderBy: { year: 'asc' },
  })
  return NextResponse.json({ events })
}
