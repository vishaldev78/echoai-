import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { currentUserId } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const ownerId = currentUserId(req)
  if (!ownerId) return NextResponse.json({ profiles: [] })
  const profiles = await db.profile.findMany({
    where: { ownerId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { memories: true, documents: true, timelineEvents: true } },
    },
  })
  return NextResponse.json({ profiles })
}

export async function POST(req: NextRequest) {
  const ownerId = currentUserId(req)
  if (!ownerId) {
    return NextResponse.json({ error: 'Sign in to create a memory' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const { name, title, field, bio, birthYear, deathYear, avatarColor, accent } = body ?? {}
  if (!name || !title || !field || !bio) {
    return NextResponse.json({ error: 'name, title, field, bio are required' }, { status: 400 })
  }
  const profile = await db.profile.create({
    data: {
      ownerId,
      name: String(name),
      title: String(title),
      field: String(field),
      bio: String(bio),
      birthYear: typeof birthYear === 'number' ? birthYear : null,
      deathYear: typeof deathYear === 'number' ? deathYear : null,
      avatarColor: avatarColor || 'fuchsia',
      accent: accent || 'cyan',
    },
  })
  return NextResponse.json({ profile })
}
