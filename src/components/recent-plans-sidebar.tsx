"use client"

import { useEffect, useState } from "react"
import { format, parseISO } from "date-fns"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { SavedPlan } from "@/lib/db"

export function RecentPlansSidebar() {
  const [plans, setPlans] = useState<SavedPlan[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch("/api/plans/recent")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch")
        return res.json() as Promise<SavedPlan[]>
      })
      .then(setPlans)
      .catch(() => setError(true))
  }, [])

  const renderBody = () => {
    if (!error && plans === null) {
      return (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )
    }

    if (error || plans === null || plans.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">No saved plans yet.</p>
      )
    }

    return (
      <ul className="flex flex-col gap-4">
        {plans.map((saved) => {
          let dateLabel = saved.generated_at
          try {
            dateLabel = format(parseISO(saved.generated_at), "EEE MMM d")
          } catch {
            // keep raw string
          }
          const firstPriority =
            saved.plan.priorities.length > 0 ? saved.plan.priorities[0] : "—"

          return (
            <li key={saved.id} className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-muted-foreground">
                {dateLabel}
              </span>
              <span className="text-sm line-clamp-2">{firstPriority}</span>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent plans.</CardTitle>
      </CardHeader>
      <CardContent>{renderBody()}</CardContent>
    </Card>
  )
}
