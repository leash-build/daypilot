import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'

export type IssueItem = {
  id: string
  identifier: string
  title: string
  url: string
  state: string
  priority: number
  team: string
}

export type IssuesState =
  | { status: 'ok'; issues: IssueItem[] }
  | { status: 'not_connected' }
  | { status: 'error'; message: string }

const PRIORITY_LABEL: Record<number, string> = {
  0: 'No priority',
  1: 'Urgent',
  2: 'High',
  3: 'Medium',
  4: 'Low',
}

const PRIORITY_STYLES: Record<number, string> = {
  1: 'bg-red-100 text-red-900 dark:bg-red-950/40 dark:text-red-200',
  2: 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
  3: 'bg-muted text-muted-foreground',
  4: 'bg-muted text-muted-foreground',
  0: 'bg-muted text-muted-foreground',
}

export function IssuesSection({ state }: { state: IssuesState }) {
  if (state.status === 'not_connected') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s issues.</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Connect Linear to see your in-progress issues here, factored into your day plan.
          </p>
          <a
            href="https://leash.build/dashboard/connections"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ size: 'sm', variant: 'outline' }) + ' self-start'}
          >
            Connect Linear
          </a>
        </CardContent>
      </Card>
    )
  }

  if (state.status === 'error') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s issues.</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Couldn&apos;t load Linear: {state.message}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (state.issues.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s issues.</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nothing in progress — clean slate.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s issues.</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3">
          {state.issues.map((issue) => (
            <li key={issue.id} className="flex gap-3">
              <span
                className={`shrink-0 self-start rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[issue.priority] ?? PRIORITY_STYLES[0]}`}
              >
                {PRIORITY_LABEL[issue.priority] ?? 'No priority'}
              </span>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-xs text-muted-foreground font-mono">
                  {issue.identifier || issue.team}
                </span>
                {issue.url ? (
                  <a
                    href={issue.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline truncate"
                  >
                    {issue.title}
                  </a>
                ) : (
                  <span className="text-sm truncate">{issue.title}</span>
                )}
                {issue.state && (
                  <span className="text-xs text-muted-foreground italic">{issue.state}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
