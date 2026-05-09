import type { NextRequest } from 'next/server'
import { getLeashUser, isAuthenticated } from '@leash/sdk/server'
import { fetchTodayContext } from '@/lib/integrations'
import { generatePlan } from '@/lib/prompt'
import { savePlan } from '@/lib/db'

export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }
  const user = getLeashUser(req)

  try {
    const { events, messages } = await fetchTodayContext(req)
    const plan = await generatePlan({ events, messages })
    const planId = await savePlan({ userId: user.id, events, messages, plan })
    return Response.json({ planId, events, messages, plan })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'internal error'
    return Response.json({ error: message }, { status: 500 })
  }
}
