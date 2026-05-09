import type { NextRequest } from 'next/server'
import { isAuthenticated } from '@leash/sdk/server'
import { getUserIdFromCookie } from '@/lib/auth'
import { recentPlans } from '@/lib/db'

export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }
  const userId = getUserIdFromCookie(req)
  if (!userId) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }
  try {
    const plans = await recentPlans(userId, 7)
    return Response.json({ plans })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'internal error'
    return Response.json({ error: message }, { status: 500 })
  }
}
