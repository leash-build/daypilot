import { Pool } from 'pg'

let _pool: Pool | null = null

export function db(): Pool {
  if (_pool) return _pool
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      'DATABASE_URL not set. Run `leash db create` to provision a Leash-managed database, ' +
        'or uncomment DATABASE_URL= in .env.example and set the value in your dashboard secrets.',
    )
  }
  _pool = new Pool({ connectionString: url, max: 5 })
  return _pool
}

export type PlanBlock = { time: string; what: string; why: string }
export type TriageItem = {
  from: string
  subject: string
  reason: string
  urgency: 'high' | 'medium' | 'low'
}
export type Plan = {
  priorities: string[]
  blocks: PlanBlock[]
  triage: TriageItem[]
}

export type SavedPlan = {
  id: string
  generated_at: string
  plan: Plan
}

export async function savePlan(input: {
  userId: string
  events: unknown
  messages: unknown
  issues: unknown
  plan: Plan
}): Promise<string> {
  // `issues` is intentionally not persisted as a separate column — keeping the
  // schema stable across the Linear addition. The full plan output already
  // captures whatever Claude surfaced from the issues input.
  void input.issues
  const { rows } = await db().query(
    `INSERT INTO plans (user_id, events, messages, plan) VALUES ($1, $2, $3, $4) RETURNING id`,
    [
      input.userId,
      JSON.stringify(input.events),
      JSON.stringify(input.messages),
      JSON.stringify(input.plan),
    ],
  )
  return rows[0].id as string
}

export async function recentPlans(userId: string, limit = 7): Promise<SavedPlan[]> {
  const { rows } = await db().query(
    `SELECT id, generated_at, plan FROM plans WHERE user_id = $1 ORDER BY generated_at DESC LIMIT $2`,
    [userId, limit],
  )
  return rows as SavedPlan[]
}
