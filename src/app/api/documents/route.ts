import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ingestDocument } from '@/lib/memory-store'

export async function GET(req: NextRequest) {
  const profileId = req.nextUrl.searchParams.get('profileId')
  if (!profileId) return NextResponse.json({ error: 'profileId required' }, { status: 400 })
  const documents = await db.document.findMany({
    where: { profileId },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ documents })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { profileId, title, sourceType, content } = body ?? {}
  if (!profileId || !title || !content || typeof content !== 'string') {
    return NextResponse.json({ error: 'profileId, title, content are required' }, { status: 400 })
  }
  const text = String(content).slice(0, 16000)

  const document = await db.document.create({
    data: {
      profileId,
      title: String(title).slice(0, 200),
      sourceType: (sourceType || 'note').toString(),
      content: text,
      charCount: text.length,
    },
  })

  try {
    const { result, counts } = await ingestDocument({
      profileId,
      documentId: document.id,
      documentTitle: document.title,
      documentText: text,
    })
    return NextResponse.json({ document, extraction: result, counts })
  } catch (err) {
    console.error('ingestion failed', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'extraction failed', document },
      { status: 500 },
    )
  }
}
