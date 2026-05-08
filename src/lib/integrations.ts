import { startOfDay, endOfDay } from 'date-fns'
import { getIntegrations } from '@leash/sdk/integrations'
import type { NextRequest } from 'next/server'

export async function fetchTodayContext(req: NextRequest): Promise<{
  events: unknown[]
  messages: unknown[]
}> {
  const now = new Date()
  const integrations = getIntegrations(req)

  const [calendarResult, gmailResult] = await Promise.all([
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

  return {
    events: calendarResult.events ?? [],
    messages: gmailResult.messages ?? [],
  }
}
