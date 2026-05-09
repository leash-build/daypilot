import { startOfDay, endOfDay } from 'date-fns'
import { getIntegrations } from '@leash/sdk/integrations'
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

function header(headers: GmailHeader[] | undefined, name: string): string {
  if (!headers) return ''
  const lower = name.toLowerCase()
  return headers.find((h) => (h.name ?? '').toLowerCase() === lower)?.value ?? ''
}

export async function fetchTodayContext(req: NextRequest): Promise<{
  events: unknown[]
  messages: NormalizedMessage[]
}> {
  const now = new Date()
  const integrations = getIntegrations(req)

  const [calendarResult, gmailListResult] = await Promise.all([
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
  }
}
