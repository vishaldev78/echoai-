import { NextResponse } from 'next/server'

// Stateless logout — the client clears its local session. This endpoint
// exists so the flow is symmetric and can be extended later (e.g. revoke
// server tokens) without changing the client.
export async function POST() {
  return NextResponse.json({ ok: true })
}
