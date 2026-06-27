import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const profile = await db.profile.findUnique({
    where: { id },
    include: {
      _count: { select: { memories: true, documents: true, timelineEvents: true, conversations: true } },
      thinkingStyle: true,
    },
  })
  if (!profile) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ profile })
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  await db.profile.delete({ where: { id } }).catch(() => {})
  return NextResponse.json({ ok: true })
}
