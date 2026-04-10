'use client'

import { useState } from 'react'
import { LeashIntegrations } from '@leash/sdk/integrations'

interface QuickSendProps {
  connected: boolean
  integrations: LeashIntegrations
}

export function QuickSend({ connected, integrations }: QuickSendProps) {
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  if (!connected) return null

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!to.trim() || !subject.trim()) return

    setSending(true)
    setError('')
    setSent(false)

    try {
      await integrations.gmail.sendMessage({
        to: to.trim(),
        subject: subject.trim(),
        body: body.trim(),
      })
      setSent(true)
      setTo('')
      setSubject('')
      setBody('')
      setTimeout(() => setSent(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
        Quick Send
      </h2>

      <form onSubmit={handleSend} className="space-y-3">
        <input
          type="email"
          placeholder="To"
          value={to}
          onChange={e => setTo(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          required
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          required
        />
        <textarea
          placeholder="Message..."
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={sending || !to.trim() || !subject.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
          {sent && <span className="text-sm text-emerald-600">Sent!</span>}
          {error && <span className="text-sm text-red-500">{error}</span>}
        </div>
      </form>
    </div>
  )
}
