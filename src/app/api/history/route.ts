import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Returns all conversations across all profiles, newest first, with the
// profile name + message count + first user question + last assistant reply.
export async function GET() {
  const conversations = await db.conversation.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      profile: { select: { id: true, name: true, title: true, field: true } },
      messages: { orderBy: { createdAt: 'asc' }, select: { role: true, content: true, createdAt: true } },
    },
    take: 200,
  })

  const items = conversations.map((c) => {
    const firstUser = c.messages.find((m) => m.role === 'user')
    const lastAssistant = [...c.messages].reverse().find((m) => m.role === 'assistant')
    return {
      id: c.id,
      profileId: c.profile.id,
      profileName: c.profile.name,
      profileTitle: c.profile.title,
      profileField: c.profile.field,
      messageCount: c.messages.length,
      firstQuestion: firstUser?.content ?? '',
      lastAnswer: lastAssistant?.content ?? '',
      createdAt: c.createdAt,
    }
  })

  return NextResponse.json({ conversations: items })
}
