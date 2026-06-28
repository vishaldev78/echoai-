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
  const owned = await db.profile.findFirst({ where: { id: profileId, ownerId }, select: { id: true, name: true } })
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

  // Save the user's question immediately so it's never lost.
  await db.message.create({
    data: { conversationId: conv.id, role: 'user', content: String(question), sources: '' },
  })

  try {
    const { answer, sources } = await chatWithMemory({
      profileId,
      question: String(question),
      history: prior.map((m) => ({ role: m.role, content: m.content })),
    })

    await db.message.create({
      data: {
        conversationId: conv.id,
        role: 'assistant',
        content: answer,
        sources: sources.map((s) => s.id).join(','),
      },
    })

    return NextResponse.json({ conversationId: conv.id, answer, sources })
  } catch (err) {
    // Local AI should rarely fail, but if it does, return a graceful message
    // and persist it so the conversation history stays consistent.
    const message = err instanceof Error ? err.message : 'AI unavailable'
    const fallback = `I couldn't generate a response right now (${message}). Your question has been saved — please try again later.`

    await db.message.create({
      data: { conversationId: conv.id, role: 'assistant', content: fallback, sources: '' },
    })

    return NextResponse.json({ conversationId: conv.id, answer: fallback, sources: [] })
  }
}
