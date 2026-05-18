import { startOfDay, endOfDay } from 'date-fns'
import { getIntegrations } from '@leash/sdk/integrations'
import type { LinearIssue } from '@leash/sdk/integrations'
import { Leash } from '@leash/sdk/leash'
import type { NextRequest } from 'next/server'

type GmailHeader = { name?: string; value?: string }
type GmailMessageMetadata = {
  id?: string
  snippet?: string
  payload?: { headers?: GmailHeader[] }
}
type NormalizedMessage = {
  id: string
  from: string
  subject: string
  date: string
  snippet: string
}

export type NormalizedIssue = {
  id: string
  identifier: string
  title: string
  url: string
  state: string
  priority: number
  team: string
}

export type LinearState =
  | { status: 'ok'; issues: NormalizedIssue[] }
  | { status: 'not_connected' }
  | { status: 'error'; message: string }

function header(headers: GmailHeader[] | undefined, name: string): string {
  if (!headers) return ''
  const lower = name.toLowerCase()
  return headers.find((h) => (h.name ?? '').toLowerCase() === lower)?.value ?? ''
}

function normalizeIssue(i: LinearIssue): NormalizedIssue {
  return {
    id: i.id,
    identifier: i.identifier ?? '',
    title: i.title ?? '',
    url: i.url ?? '',
    state: i.state?.name ?? '',
    priority: i.priority ?? 0,
    team: i.team?.key ?? '',
  }
}

async function fetchLinearIssues(req: NextRequest): Promise<LinearState> {
  try {
    const leash = new Leash({ request: req })
    // The SDK's listIssues filter is { teamId?, assigneeId?, stateType?, limit?, cursor? }.
    // We surface in-progress work for the day plan; the Linear PAT scopes results
    // to the connected user's workspace.
    const result = await leash.integrations.linear.listIssues({
      stateType: 'started',
      limit: 25,
    })
    return { status: 'ok', issues: (result.issues ?? []).map(normalizeIssue) }
  } catch (err) {
    // SDK throws LeashError with code 'INTEGRATION_NOT_ENABLED' (403) when the
    // user hasn't connected Linear — distinguish from real errors so the UI can
    // render a "connect" CTA instead of an error banner.
    const code = (err as { code?: string } | null)?.code
    if (code === 'INTEGRATION_NOT_ENABLED') {
      return { status: 'not_connected' }
    }
    const message = err instanceof Error ? err.message : 'Failed to load Linear issues'
    return { status: 'error', message }
  }
}

export async function fetchTodayContext(req: NextRequest): Promise<{
  events: unknown[]
  messages: NormalizedMessage[]
  linear: LinearState
}> {
  const now = new Date()
  const integrations = getIntegrations(req)

  const [calendarResult, gmailListResult, linear] = await Promise.all([
    integrations.calendar.listEvents({
      calendarId: 'primary',
      timeMin: startOfDay(now).toISOString(),
      timeMax: endOfDay(now).toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    }),
    integrations.gmail.listMessages({
      query: 'newer_than:1d',
      maxResults: 30,
    }),
    fetchLinearIssues(req),
  ])

  // gmail.listMessages returns just {id, threadId}. Fan out to getMessage
  // with format='metadata' so Claude has real subject/from/date/snippet to
  // reason over (otherwise it sees only opaque ids and produces "<UNKNOWN>"
  // triage entries).
  const ids: string[] = (gmailListResult.messages ?? [])
    .map((m: { id?: string }) => m.id)
    .filter((id): id is string => typeof id === 'string')

  const metas = await Promise.all(
    ids.map((id) =>
      integrations.gmail
        .getMessage(id, 'metadata')
        .catch(() => null) as Promise<GmailMessageMetadata | null>,
    ),
  )

  const messages: NormalizedMessage[] = metas
    .filter((m): m is GmailMessageMetadata => m !== null)
    .map((m) => ({
      id: m.id ?? '',
      from: header(m.payload?.headers, 'From'),
      subject: header(m.payload?.headers, 'Subject'),
      date: header(m.payload?.headers, 'Date'),
      snippet: m.snippet ?? '',
    }))

  return {
    events: calendarResult.events ?? [],
    messages,
    linear,
  }
}
