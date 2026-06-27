import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const profileId = req.nextUrl.searchParams.get('profileId')
  if (!profileId) return NextResponse.json({ error: 'profileId required' }, { status: 400 })
  const [nodes, edges] = await Promise.all([
    db.graphNode.findMany({ where: { profileId } }),
    db.graphEdge.findMany({ where: { profileId } }),
  ])
  return NextResponse.json({ nodes, edges })
}
