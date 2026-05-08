'use client'

import { LeashProvider } from '@leash/sdk'

export function Providers({ children }: { children: React.ReactNode }) {
  return <LeashProvider>{children}</LeashProvider>
}
