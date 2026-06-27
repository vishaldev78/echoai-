import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { currentUserId } from '@/lib/auth'

// Returns all conversations for profiles OWNED by the current user only.
export async function GET(req: NextRequest) {
  const ownerId = currentUserId(req)
  if (!ownerId) return NextResponse.json({ conversations: [] })
  const conversations = await db.conversation.findMany({
    where: { profile: { ownerId } },
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
