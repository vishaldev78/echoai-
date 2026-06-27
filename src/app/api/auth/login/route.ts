import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Simple Name + Age login. Upserts a user (unique on name+age) and returns it.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { name, age } = body ?? {}
  if (!name || typeof name !== 'string' || !age || typeof age !== 'number' || age < 1 || age > 150) {
    return NextResponse.json({ error: 'name and valid age are required' }, { status: 400 })
  }
  const user = await db.user.upsert({
    where: { name_age: { name: String(name).trim(), age: Number(age) } },
    create: { name: String(name).trim(), age: Number(age) },
    update: {},
  })
  return NextResponse.json({ user: { id: user.id, name: user.name, age: user.age } })
}
