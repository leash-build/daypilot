import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'

type Provider = 'gmail' | 'google_calendar'

const PROVIDER_LABELS: Record<Provider, string> = {
  gmail: 'Gmail',
  google_calendar: 'Google Calendar',
}

type Props = {
  missingProviders: Provider[]
}

export function ConnectPrompt({ missingProviders }: Props) {
  const names = missingProviders.map((p) => PROVIDER_LABELS[p]).join(' and ')

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Connect your accounts</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <p className="text-sm text-muted-foreground">
            Daypilot needs your {names} to plan your day. Connect{' '}
            {missingProviders.length === 1 ? 'it' : 'them'} below and come back — your briefing
            will be ready.
          </p>
          <ul className="flex flex-col gap-3">
            {missingProviders.map((provider) => (
              <li key={provider} className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium">{PROVIDER_LABELS[provider]}</span>
                <a
                  href="https://leash.build/dashboard/connections"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ size: 'sm', variant: 'outline' })}
                >
                  Connect {PROVIDER_LABELS[provider]}
                </a>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
