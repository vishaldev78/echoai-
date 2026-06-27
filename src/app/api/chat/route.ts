import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { currentUserId } from '@/lib/auth'
import { chatWithMemory } from '@/lib/ai'

export async function POST(req: NextRequest) {
  const ownerId = currentUserId(req)
  if (!ownerId) {
    return NextResponse.json({ error: 'Sign in to chat' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const { profileId, question, conversationId } = body ?? {}
  if (!profileId || !question) {
    return NextResponse.json({ error: 'profileId and question are required' }, { status: 400 })
  }

  // verify ownership of the profile
  const owned = await db.profile.findFirst({ where: { id: profileId, ownerId }, select: { id: true } })
  if (!owned) return NextResponse.json({ error: 'not found' }, { status: 404 })

  // find or create conversation (must belong to this profile)
  let conv = conversationId
    ? await db.conversation.findFirst({ where: { id: conversationId, profileId } })
    : null
  if (!conv) {
    conv = await db.conversation.create({ data: { profileId } })
  }

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
