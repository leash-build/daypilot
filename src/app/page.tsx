'use client'

import { useState, useEffect } from 'react'
import { LeashIntegrations } from '@leash/sdk/integrations'
import { CalendarSection } from '@/components/calendar-section'
import { GmailSection } from '@/components/gmail-section'
import { DriveSection } from '@/components/drive-section'
import { QuickSend } from '@/components/quick-send'
import { ConnectBanner } from '@/components/connect-banner'

const integrations = new LeashIntegrations({
  apiKey: process.env.NEXT_PUBLIC_LEASH_API_KEY,
})

type ConnectionMap = Record<string, boolean>

export default function Home() {
  const [connections, setConnections] = useState<ConnectionMap>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkConnections() {
      try {
        const conns = await integrations.getConnections()
        const map: ConnectionMap = {}
        for (const c of conns) {
          map[c.providerId] = c.status === 'active'
        }
        setConnections(map)
      } catch {
        // Not authenticated or error
      } finally {
        setLoading(false)
      }
    }
    checkConnections()
  }, [])

  const today = new Date()
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-zinc-400">Loading...</div>
      </div>
    )
  }

  const allConnected = connections.gmail && connections.google_calendar && connections.google_drive
  const noneConnected = !connections.gmail && !connections.google_calendar && !connections.google_drive

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{greeting}</h1>
        <p className="text-zinc-500 mt-1">{dateStr}</p>
      </header>

      {/* Connection banners */}
      {noneConnected && (
        <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Connect your accounts to get started</h2>
          <p className="text-zinc-500 text-sm mb-4">
            DayPilot pulls your emails, calendar, and files into one daily briefing.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <ConnectBanner provider="gmail" label="Gmail" integrations={integrations} />
            <ConnectBanner provider="google_calendar" label="Calendar" integrations={integrations} />
            <ConnectBanner provider="google_drive" label="Drive" integrations={integrations} />
          </div>
        </div>
      )}

      {!noneConnected && !allConnected && (
        <div className="mb-6 flex gap-2 flex-wrap">
          {!connections.gmail && <ConnectBanner provider="gmail" label="Gmail" integrations={integrations} />}
          {!connections.google_calendar && <ConnectBanner provider="google_calendar" label="Calendar" integrations={integrations} />}
          {!connections.google_drive && <ConnectBanner provider="google_drive" label="Drive" integrations={integrations} />}
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar — left column, full height */}
        <div className="lg:col-span-1">
          <CalendarSection connected={!!connections.google_calendar} integrations={integrations} />
        </div>

        {/* Gmail + Drive — right two columns */}
        <div className="lg:col-span-2 space-y-6">
          <GmailSection connected={!!connections.gmail} integrations={integrations} />
          <QuickSend connected={!!connections.gmail} integrations={integrations} />
          <DriveSection connected={!!connections.google_drive} integrations={integrations} />
        </div>
      </div>
    </div>
  )
}
