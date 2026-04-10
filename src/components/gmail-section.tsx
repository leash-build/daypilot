'use client'

import { useState, useEffect } from 'react'
import { LeashIntegrations } from '@leash/sdk/integrations'

interface GmailMessage {
  id: string
  threadId: string
  snippet?: string
  payload?: {
    headers?: { name: string; value: string }[]
  }
  internalDate?: string
}

interface GmailSectionProps {
  connected: boolean
  integrations: LeashIntegrations
}

export function GmailSection({ connected, integrations }: GmailSectionProps) {
  const [messages, setMessages] = useState<GmailMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!connected) { setLoading(false); return }

    async function fetchMessages() {
      try {
        // Get today's unread messages
        const today = new Date()
        const dateStr = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`
        const list = await integrations.gmail.listMessages({
          query: `is:unread after:${dateStr}`,
          maxResults: 8,
        })

        // Fetch full message details
        const detailed = await Promise.all(
          (list.messages || []).map((m: { id: string }) =>
            integrations.gmail.getMessage(m.id, 'metadata')
          )
        )
        setMessages(detailed)
      } catch (err) {
        console.error('Gmail fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMessages()
  }, [connected, integrations])

  function getHeader(msg: GmailMessage, name: string): string {
    return msg.payload?.headers?.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || ''
  }

  function formatSender(from: string): string {
    // "John Doe <john@example.com>" → "John Doe"
    const match = from.match(/^(.+?)\s*</)
    return match ? match[1].replace(/"/g, '') : from.split('@')[0]
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
        Unread Emails
      </h2>

      {!connected && (
        <p className="text-sm text-zinc-400">Connect Gmail to see your inbox.</p>
      )}

      {connected && loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="h-8 w-8 bg-zinc-100 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-zinc-100 rounded w-32 mb-1" />
                <div className="h-3 bg-zinc-100 rounded w-48" />
              </div>
            </div>
          ))}
        </div>
      )}

      {connected && !loading && messages.length === 0 && (
        <p className="text-sm text-zinc-400">No unread emails today. Inbox zero!</p>
      )}

      {connected && !loading && messages.length > 0 && (
        <div className="divide-y divide-zinc-100">
          {messages.map(msg => {
            const from = getHeader(msg, 'From')
            const subject = getHeader(msg, 'Subject')
            const sender = formatSender(from)
            const initial = sender[0]?.toUpperCase() || '?'

            return (
              <div key={msg.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-semibold shrink-0">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">{sender}</span>
                  </div>
                  <div className="text-sm text-zinc-700 truncate">{subject}</div>
                  {msg.snippet && (
                    <div className="text-xs text-zinc-400 truncate mt-0.5">{msg.snippet}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
