import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { currentUserId } from '@/lib/auth'

async function ownedProfile(profileId: string, ownerId: string) {
  return db.profile.findFirst({ where: { id: profileId, ownerId }, select: { id: true } })
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const ownerId = currentUserId(req)
  if (!ownerId) return NextResponse.json({ error: 'not found' }, { status: 404 })
  const profile = await db.profile.findFirst({
    where: { id, ownerId },
    include: {
      _count: { select: { memories: true, documents: true, timelineEvents: true, conversations: true } },
      thinkingStyle: true,
    },
  })
  if (!profile) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ profile })
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const ownerId = currentUserId(req)
  if (!ownerId) return NextResponse.json({ ok: true })
  // only delete if owned by the caller
  const owned = await ownedProfile(id, ownerId)
  if (owned) await db.profile.delete({ where: { id } }).catch(() => {})
  return NextResponse.json({ ok: true })
}
