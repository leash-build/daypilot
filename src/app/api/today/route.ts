import type { NextRequest } from 'next/server'
import { Leash } from '@leash/sdk/leash'
import { fetchTodayContext } from '@/lib/integrations'
import { generatePlan } from '@/lib/prompt'
import { savePlan } from '@/lib/db'

export async function GET(req: NextRequest) {
  const leash = new Leash({ request: req })
  const user = leash.auth.user()
  if (!user) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const { events, messages, linear } = await fetchTodayContext(req)
    const issuesForPrompt = linear.status === 'ok' ? linear.issues : []
    const plan = await generatePlan({ events, messages, issues: issuesForPrompt })
    const planId = await savePlan({
      userId: user.id,
      events,
      messages,
      issues: issuesForPrompt,
      plan,
    })
    return Response.json({ planId, events, messages, linear, plan })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'internal error'
    return Response.json({ error: message }, { status: 500 })
  }
}
