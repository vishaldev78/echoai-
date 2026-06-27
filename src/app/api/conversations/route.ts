import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { currentUserId } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const profileId = req.nextUrl.searchParams.get('profileId')
  const ownerId = currentUserId(req)
  if (!profileId || !ownerId) return NextResponse.json({ conversation: null })
  // only return if the profile belongs to the caller
  const owned = await db.profile.findFirst({ where: { id: profileId, ownerId }, select: { id: true } })
  if (!owned) return NextResponse.json({ conversation: null })
  const conv = await db.conversation.findFirst({
    where: { profileId },
    orderBy: { createdAt: 'desc' },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  })
  return NextResponse.json({ conversation: conv ?? null })
}

export async function DELETE(req: NextRequest) {
  const profileId = req.nextUrl.searchParams.get('profileId')
  const ownerId = currentUserId(req)
  if (!profileId || !ownerId) return NextResponse.json({ ok: true })
  const owned = await db.profile.findFirst({ where: { id: profileId, ownerId }, select: { id: true } })
  if (owned) await db.conversation.deleteMany({ where: { profileId } })
  return NextResponse.json({ ok: true })
}
