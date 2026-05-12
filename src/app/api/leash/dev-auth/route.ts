// Mount point for the "Open in local dev" flow.
//
// When you click "Open in local dev" on your leash.build dashboard,
// the dashboard redirects you here with a one-time exchange code:
//
//   http://localhost:3000/api/leash/dev-auth?code=dev_<32-char-random>
//
// The SDK's static factory handles the rest: server-to-server posts the
// code to leash.build's exchange-code endpoint, gets back a JWT, sets it
// as an HttpOnly cookie scoped to localhost, and redirects to `/`. After
// that, the rest of daypilot sees the user as signed in (via
// leash.auth.user() in the API routes).
//
// You only need this file in dev. In production, *.un.leash.build cookies
// flow automatically and this route is never hit.
//
// Note: the folder is named `leash`, not `_leash`. Next.js App Router
// treats underscore-prefixed directories as private and excludes them
// from routing — see https://nextjs.org/docs/app/api-reference/file-conventions/private-folder

import { Leash } from '@leash/sdk/leash'

export const GET = Leash.createDevAuthHandler()
