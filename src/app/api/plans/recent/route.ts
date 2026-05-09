import type { NextRequest } from 'next/server'
import { getLeashUser, isAuthenticated } from '@leash/sdk/server'
import { recentPlans } from '@/lib/db'

export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }
  const user = getLeashUser(req)
  try {
    const plans = await recentPlans(user.id, 7)
    return Response.json({ plans })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'internal error'
    return Response.json({ error: message }, { status: 500 })
  }
}
