'use client'

import { useState, useEffect } from 'react'
import { LeashIntegrations } from '@leash/sdk/integrations'

interface CalendarEvent {
  id: string
  summary: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
  attendees?: { email: string; responseStatus?: string }[]
  location?: string
  htmlLink?: string
}

interface CalendarSectionProps {
  connected: boolean
  integrations: LeashIntegrations
}

export function CalendarSection({ connected, integrations }: CalendarSectionProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!connected) { setLoading(false); return }

    async function fetchEvents() {
      try {
        const now = new Date()
        const endOfDay = new Date(now)
        endOfDay.setHours(23, 59, 59, 999)

        const data = await integrations.calendar.listEvents({
          timeMin: now.toISOString(),
          timeMax: endOfDay.toISOString(),
          maxResults: 10,
          singleEvents: true,
          orderBy: 'startTime',
        })
        setEvents((data as any).events || (data as any).items || [])
      } catch (err) {
        console.error('Calendar fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [connected, integrations])

  function formatTime(event: CalendarEvent): string {
    const dt = event.start.dateTime
    if (!dt) return 'All day'
    return new Date(dt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  function formatEndTime(event: CalendarEvent): string {
    const dt = event.end.dateTime
    if (!dt) return ''
    return new Date(dt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
        Today&apos;s Schedule
      </h2>

      {!connected && (
        <p className="text-sm text-zinc-400">Connect Calendar to see your schedule.</p>
      )}

      {connected && loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-zinc-100 rounded w-20 mb-1" />
              <div className="h-4 bg-zinc-100 rounded w-40" />
            </div>
          ))}
        </div>
      )}

      {connected && !loading && events.length === 0 && (
        <p className="text-sm text-zinc-400">No more events today.</p>
      )}

      {connected && !loading && events.length > 0 && (
        <div className="space-y-4">
          {events.map(event => (
            <div key={event.id} className="border-l-2 border-indigo-400 pl-3">
              <div className="text-xs text-zinc-500">
                {formatTime(event)}{event.end.dateTime ? ` - ${formatEndTime(event)}` : ''}
              </div>
              <div className="text-sm font-medium mt-0.5">{event.summary}</div>
              {event.location && (
                <div className="text-xs text-zinc-400 mt-0.5">{event.location}</div>
              )}
              {event.attendees && event.attendees.length > 0 && (
                <div className="text-xs text-zinc-400 mt-1">
                  {event.attendees.length} attendee{event.attendees.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
