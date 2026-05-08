import { format, parseISO } from "date-fns"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

type Props = { events: unknown[] }

type CalendarEventStart = { dateTime?: string; date?: string }
type CalendarEvent = {
  summary?: string
  start?: CalendarEventStart
  attendees?: unknown[]
}

function isCalendarEvent(e: unknown): e is CalendarEvent {
  return typeof e === "object" && e !== null
}

function parseStartTime(start: CalendarEventStart | undefined): {
  label: string
  allDay: boolean
} {
  if (!start) return { label: "—", allDay: false }

  if (start.dateTime) {
    try {
      return { label: format(parseISO(start.dateTime), "HH:mm"), allDay: false }
    } catch {
      return { label: "—", allDay: false }
    }
  }

  if (start.date) {
    return { label: "All day", allDay: true }
  }

  return { label: "—", allDay: false }
}

export function EventsSection({ events }: Props) {
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s events.</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No events today — Claude has the day off too.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s events.</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3">
          {events.map((raw, i) => {
            const event = isCalendarEvent(raw) ? raw : {}
            const { label } = parseStartTime(event.start)
            const summary =
              typeof event.summary === "string" && event.summary.length > 0
                ? event.summary
                : "Untitled event"
            const attendeeCount =
              Array.isArray(event.attendees) && event.attendees.length > 0
                ? event.attendees.length
                : null

            return (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 font-mono text-xs text-muted-foreground pt-0.5 w-14">
                  {label}
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm">{summary}</span>
                  {attendeeCount !== null && (
                    <span className="text-xs text-muted-foreground">
                      {attendeeCount} attendee{attendeeCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
