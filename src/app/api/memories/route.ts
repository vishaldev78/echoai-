import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const profileId = req.nextUrl.searchParams.get('profileId')
  if (!profileId) return NextResponse.json({ error: 'profileId required' }, { status: 400 })
  const memories = await db.memory.findMany({
    where: { profileId },
    orderBy: [{ year: 'asc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json({ memories })
}
