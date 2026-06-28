import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { currentUserId } from '@/lib/auth'
import { ingestDocument } from '@/lib/memory-store'

async function ownedProfileId(profileId: string, ownerId: string) {
  const p = await db.profile.findFirst({ where: { id: profileId, ownerId }, select: { id: true } })
  return p?.id
}

export async function GET(req: NextRequest) {
  const profileId = req.nextUrl.searchParams.get('profileId')
  const ownerId = currentUserId(req)
  if (!profileId || !ownerId) return NextResponse.json({ documents: [] })
  const pid = await ownedProfileId(profileId, ownerId)
  if (!pid) return NextResponse.json({ documents: [] })
  const documents = await db.document.findMany({
    where: { profileId: pid },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ documents })
}

export async function POST(req: NextRequest) {
  const ownerId = currentUserId(req)
  if (!ownerId) {
    return NextResponse.json({ error: 'Sign in to upload' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const { profileId, title, sourceType, content } = body ?? {}
  if (!profileId || !title || !content || typeof content !== 'string') {
    return NextResponse.json({ error: 'profileId, title, content are required' }, { status: 400 })
  }
  const pid = await ownedProfileId(profileId, ownerId)
  if (!pid) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const text = String(content).slice(0, 16000)
  // Save the document FIRST so it's preserved even if AI extraction fails.
  const document = await db.document.create({
    data: {
      profileId: pid,
      title: String(title).slice(0, 200),
      sourceType: (sourceType || 'note').toString(),
      content: text,
      charCount: text.length,
    },
  })

  // Attempt AI extraction. If it fails (e.g. z-ai SDK not configured locally),
  // return a graceful partial success instead of a 500 — the document is saved
  // and the user can still view it; memories/graph/timeline just won't be
  // generated until the AI is available.
  try {
    const { result, counts } = await ingestDocument({
      profileId: pid,
      documentId: document.id,
      documentTitle: document.title,
      documentText: text,
    })
    return NextResponse.json({ document, extraction: result, counts })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'extraction failed'
    console.error('ingestion failed (document still saved):', message)
    return NextResponse.json({
      document,
      extraction: null,
      counts: { memories: 0, timeline: 0, nodes: 0, edges: 0 },
      warning: 'Document saved, but extraction failed: ' + message,
    })
  }
}
