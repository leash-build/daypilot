'use client'

import { LeashIntegrations } from '@leash/sdk/integrations'

interface ConnectBannerProps {
  provider: string
  label: string
  integrations: LeashIntegrations
}

export function ConnectBanner({ provider, label, integrations }: ConnectBannerProps) {
  const connectUrl = integrations.getConnectUrl(provider, window.location.href)

  return (
    <a
      href={connectUrl}
      className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50 transition-colors"
    >
      <span className="h-2 w-2 rounded-full bg-amber-400" />
      Connect {label}
    </a>
  )
}
