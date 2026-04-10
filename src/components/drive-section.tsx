'use client'

import { useState, useEffect } from 'react'
import { LeashIntegrations } from '@leash/sdk/integrations'

interface DriveFile {
  id: string
  name: string
  mimeType: string
  modifiedTime?: string
  webViewLink?: string
  iconLink?: string
  owners?: { displayName: string; emailAddress: string }[]
}

interface DriveSectionProps {
  connected: boolean
  integrations: LeashIntegrations
}

const MIME_ICONS: Record<string, string> = {
  'application/vnd.google-apps.document': '📄',
  'application/vnd.google-apps.spreadsheet': '📊',
  'application/vnd.google-apps.presentation': '📑',
  'application/vnd.google-apps.folder': '📁',
  'application/pdf': '📕',
  'image/': '🖼️',
}

function getIcon(mimeType: string): string {
  for (const [key, icon] of Object.entries(MIME_ICONS)) {
    if (mimeType.startsWith(key)) return icon
  }
  return '📎'
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function DriveSection({ connected, integrations }: DriveSectionProps) {
  const [files, setFiles] = useState<DriveFile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!connected) { setLoading(false); return }

    async function fetchFiles() {
      try {
        const data = await integrations.drive.listFiles({ maxResults: 8 })
        setFiles(data.files || [])
      } catch (err) {
        console.error('Drive fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchFiles()
  }, [connected, integrations])

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
        Recent Files
      </h2>

      {!connected && (
        <p className="text-sm text-zinc-400">Connect Drive to see your recent files.</p>
      )}

      {connected && loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="h-6 w-6 bg-zinc-100 rounded" />
              <div className="h-4 bg-zinc-100 rounded w-40" />
            </div>
          ))}
        </div>
      )}

      {connected && !loading && files.length === 0 && (
        <p className="text-sm text-zinc-400">No recent files.</p>
      )}

      {connected && !loading && files.length > 0 && (
        <div className="space-y-2">
          {files.map(file => (
            <a
              key={file.id}
              href={file.webViewLink || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-zinc-50 transition-colors"
            >
              <span className="text-lg">{getIcon(file.mimeType)}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{file.name}</div>
              </div>
              {file.modifiedTime && (
                <span className="text-xs text-zinc-400 shrink-0">{timeAgo(file.modifiedTime)}</span>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
