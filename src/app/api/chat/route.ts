import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { chatWithMemory } from '@/lib/ai'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { profileId, question, conversationId } = body ?? {}
  if (!profileId || !question) {
    return NextResponse.json({ error: 'profileId and question are required' }, { status: 400 })
  }

  // find or create conversation
  let conv = conversationId
    ? await db.conversation.findUnique({ where: { id: conversationId } })
    : null
  if (!conv) {
    conv = await db.conversation.create({ data: { profileId } })
  }

  // load recent history (last 16 messages)
  const prior = await db.message.findMany({
    where: { conversationId: conv.id },
    orderBy: { createdAt: 'asc' },
    take: 16,
  })

  const { answer, sources } = await chatWithMemory({
    profileId,
    question: String(question),
    history: prior.map((m) => ({ role: m.role, content: m.content })),
  })

  // persist user + assistant messages
  await db.message.createMany({
    data: [
      { conversationId: conv.id, role: 'user', content: String(question), sources: '' },
      {
        conversationId: conv.id,
        role: 'assistant',
        content: answer,
        sources: sources.map((s) => s.id).join(','),
      },
    ],
  })

  return NextResponse.json({ conversationId: conv.id, answer, sources })
}
