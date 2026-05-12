import type { NextRequest } from 'next/server'

// Workaround for an @leash/sdk bug: getLeashUser() reads `payload.sub` from
// the leash-auth JWT, but the platform's user-auth tokens carry `userId`
// instead (only app-scoped tokens like the Supabase token use `sub`). As a
// result, getLeashUser(req).id is undefined for any app calling it from a
// browser session. Tracked in Linear as the SDK fix; until that ships, we
// decode the cookie ourselves to get a stable user id for DB writes.
export function getUserIdFromCookie(req: NextRequest): string | null {
  const cookie = req.cookies.get('leash-auth')
  if (!cookie?.value) return null
  const parts = cookie.value.split('.')
  if (parts.length !== 3) return null
  try {
    const padded = parts[1] + '='.repeat((4 - (parts[1].length % 4)) % 4)
    const payload = JSON.parse(
      Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'),
    ) as { userId?: string; sub?: string }
    return payload.userId ?? payload.sub ?? null
  } catch {
    return null
  }
}
