import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import type { TriageItem } from "@/lib/db"

type Props = { triage: TriageItem[] }

const urgencyStyles: Record<TriageItem["urgency"], string> = {
  high: "bg-red-100 text-red-900 dark:bg-red-950/40 dark:text-red-200",
  medium: "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  low: "bg-muted text-muted-foreground",
}

export function TriageSection({ triage }: Props) {
  if (triage.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Triage queue.</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Inbox is quiet — nothing flagged.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Triage queue.</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-4">
          {triage.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span
                className={`shrink-0 self-start rounded-full px-2 py-0.5 text-xs font-medium capitalize ${urgencyStyles[item.urgency]}`}
              >
                {item.urgency}
              </span>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-xs text-muted-foreground truncate">{item.from}</span>
                <span className="text-sm">{item.subject}</span>
                <span className="text-xs text-muted-foreground italic">{item.reason}</span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
