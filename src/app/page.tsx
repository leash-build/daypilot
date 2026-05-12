'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { useLeashAuth } from '@leash/sdk'
import { LeashIntegrations } from '@leash/sdk/integrations'
import type { ConnectionStatus } from '@leash/sdk/integrations'
import type { Plan } from '@/lib/db'
import { PlanSection } from '@/components/plan-section'
import { EventsSection } from '@/components/events-section'
import { TriageSection } from '@/components/triage-section'
import { RecentPlansSidebar } from '@/components/recent-plans-sidebar'
import { ConnectPrompt } from '@/components/connect-prompt'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type Provider = 'gmail' | 'google_calendar'

const REQUIRED_PROVIDERS: Provider[] = ['gmail', 'google_calendar']

type TodayData = {
  plan: Plan
  events: unknown[]
}

type TodayState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; data: TodayData }
  | { status: 'error'; message: string }

type ConnectionsState =
  | { status: 'loading' }
  | { status: 'ok'; missing: Provider[] }
  | { status: 'error' }

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function SkeletonPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
          <div className="flex flex-col gap-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}

function SignInPrompt() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 bg-zinc-50 dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in to Daypilot</h1>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Daypilot signs you in through your Leash dashboard.</p>
          <p>
            Open your daypilot app page in the dashboard and click{' '}
            <span className="font-medium text-foreground">Open in local dev</span>.
            You&apos;ll be redirected back here, signed in.
          </p>
        </div>
        <a
          href="https://leash.build/dashboard/apps"
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ size: 'lg' })}
        >
          Open Leash Dashboard
        </a>
        <p className="text-xs text-muted-foreground/70">
          Production users on <code>{'*.un.leash.build'}</code> sign in automatically — this
          screen only appears in local development.
        </p>
      </div>
    </div>
  )
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col gap-4 pt-6">
          <p className="text-sm font-medium text-destructive">Something went wrong</p>
          <p className="text-sm text-muted-foreground">{message}</p>
          <Button variant="outline" size="sm" onClick={onRetry} className="self-start">
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function HomePage() {
  const { user, isLoading: authLoading } = useLeashAuth()
  const isAuthenticated = user !== null

  const [connections, setConnections] = useState<ConnectionsState>({ status: 'loading' })
  const [today, setToday] = useState<TodayState>({ status: 'idle' })

  async function fetchConnections() {
    setConnections({ status: 'loading' })
    try {
      const integrations = new LeashIntegrations()
      const conns: ConnectionStatus[] = await integrations.getConnections()
      const connectedSet = new Set(
        conns.filter((c) => c.status === 'active').map((c) => c.providerId),
      )
      const missing = REQUIRED_PROVIDERS.filter((p) => !connectedSet.has(p))
      setConnections({ status: 'ok', missing })
    } catch {
      setConnections({ status: 'error' })
    }
  }

  async function fetchToday() {
    setToday({ status: 'loading' })
    try {
      const res = await fetch('/api/today')
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        setToday({
          status: 'error',
          message: typeof body.error === 'string' ? body.error : `HTTP ${res.status}`,
        })
        return
      }
      const body = await res.json()
      setToday({ status: 'ok', data: { plan: body.plan, events: body.events ?? [] } })
    } catch (err) {
      setToday({
        status: 'error',
        message: err instanceof Error ? err.message : 'Failed to load today\'s briefing.',
      })
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      void fetchConnections()
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (
      connections.status === 'ok' &&
      connections.missing.length === 0 &&
      today.status === 'idle'
    ) {
      void fetchToday()
    }
  }, [connections, today.status])

  // Auth loading
  if (authLoading) {
    return <SkeletonPage />
  }

  // Unauthenticated
  if (!isAuthenticated) {
    return <SignInPrompt />
  }

  // Connections loading
  if (connections.status === 'loading') {
    return <SkeletonPage />
  }

  // Connections error
  if (connections.status === 'error') {
    return (
      <ErrorCard
        message="Could not check your connected accounts. Please refresh."
        onRetry={() => void fetchConnections()}
      />
    )
  }

  // Missing connections
  if (connections.missing.length > 0) {
    return <ConnectPrompt missingProviders={connections.missing} />
  }

  // Today data loading
  if (today.status === 'idle' || today.status === 'loading') {
    return <SkeletonPage />
  }

  // Today data error
  if (today.status === 'error') {
    return (
      <ErrorCard
        message={today.message}
        onRetry={() => {
          setToday({ status: 'idle' })
          void fetchToday()
        }}
      />
    )
  }

  const { plan, events } = today.data
  const triage = plan?.triage ?? []
  const todayDate = format(new Date(), 'EEEE, MMMM d')

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {getGreeting()}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{todayDate}</p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
          <main className="flex flex-col gap-6">
            <PlanSection plan={plan ?? null} />
            <EventsSection events={events} />
            <TriageSection triage={triage} />
          </main>
          <aside>
            <RecentPlansSidebar />
          </aside>
        </div>
      </div>
    </div>
  )
}
