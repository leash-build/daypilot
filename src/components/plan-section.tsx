import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import type { Plan } from "@/lib/db"

type Props = { plan: Plan | null }

export function PlanSection({ plan }: Props) {
  if (plan === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s plan.</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No plan yet — connect Gmail and Calendar to get one.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s plan.</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {plan.priorities.length > 0 && (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Priorities
            </h3>
            <ol className="flex flex-col gap-1">
              {plan.priorities.map((priority, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {i + 1}.
                  </span>
                  <span>{priority}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {plan.blocks.length > 0 && (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Suggested blocks
            </h3>
            <ol className="flex flex-col gap-3">
              {plan.blocks.map((block, i) => (
                <li key={i} className="flex gap-3">
                  <span className="shrink-0 font-mono text-xs text-muted-foreground pt-0.5 w-20">
                    {block.time}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{block.what}</span>
                    <span className="text-xs text-muted-foreground">{block.why}</span>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
      </CardContent>
    </Card>
  )
}
