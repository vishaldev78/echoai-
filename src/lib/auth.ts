import { NextRequest } from 'next/server'

/** Read the requesting user's id from the x-user-id header. */
export function currentUserId(req: NextRequest): string | null {
  const id = req.headers.get('x-user-id')
  return id && id.length > 0 ? id : null
}
