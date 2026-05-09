# Daypilot

> The Leash example app — your day, planned, by Claude.

Daypilot pulls today's calendar events and the last 24 hours of email through `@leash/sdk`, hands them to Claude, and renders a prioritized day plan, your raw events, and a triage queue of emails that need a response today. Every plan is saved to Postgres; the sidebar shows the last seven.

It's also the canonical example for how to build on Leash.

![Daypilot — hero](./docs/screenshots/hero.png)

## Quickstart

```bash
# 1. Clone + install
gh repo clone leash-build/daypilot my-daypilot
cd my-daypilot && npm install

# 2. Local Postgres for dev — daypilot uses your local DB just like any
#    other Postgres app. (When you `leash deploy`, Leash provisions a
#    managed Postgres in the cloud and injects DATABASE_URL automatically.)
docker run -d --name daypilot-pg -p 5432:5432 -e POSTGRES_PASSWORD=local postgres:16
docker exec daypilot-pg psql -U postgres -c "CREATE DATABASE daypilot"
docker exec -i daypilot-pg psql -U postgres -d daypilot < supabase/schema.sql

# 3. Sign in to Leash + connect Gmail and Calendar OAuth
leash login
# Visit https://leash.build/dashboard/connections and grant Gmail + Calendar

# 4. Bind the local checkout to a Leash app
leash init --name daypilot

# 5. Get your keys and write .env.local
#    - Anthropic key: https://console.anthropic.com/settings/keys
#    - Leash API key: https://leash.build/dashboard/organization (Settings → API keys)
cat > .env.local <<EOF
DATABASE_URL=postgres://postgres:local@localhost:5432/daypilot
ANTHROPIC_API_KEY=sk-ant-...
LEASH_API_KEY=lsk_live_...
EOF

# 6. Run
npm run dev
```

Open `http://localhost:3000`, you'll sign in with the Leash auth that's already in your CLI session, and Claude will draft your day in ~10 seconds.

## How the SDK is used

`src/lib/integrations.ts` builds an authenticated server-side client from the incoming request and fetches today's primary-calendar events plus the last 24h of Gmail in parallel. For each Gmail message it fans out to `getMessage(id, 'metadata')` so Claude has real subject + sender + snippet to reason over.

`src/app/api/today/route.ts` is the orchestrator — identifies the user from the `leash-auth` cookie, calls the integrations helper, hands the result to Claude (`src/lib/prompt.ts`), persists the plan to Postgres, and returns the bundle.

The SDK reads the user's `leash-auth` cookie automatically; provider OAuth (Gmail, Calendar) is configured once in your Leash dashboard. Daypilot never sees raw OAuth tokens.

## What's in `.env.example`

Only the env keys daypilot's *application code* reads. For v1 that's `ANTHROPIC_API_KEY`. The file's comments explain the contract:

- **Don't declare** `LEASH_*` vars (auth cookie etc.) — those are runtime-injected.
- **Don't declare** `DATABASE_URL` *if you're using a Leash-managed Postgres* in production — `leash deploy` injects it.
- **Do declare** your own keys (Anthropic, Stripe, OpenAI, etc.) and set their values in dashboard secrets.

The BYO-database override is the bottom half of the file: a commented-out `DATABASE_URL=` line that you can uncomment if you'd rather point at your own Postgres in production.

## What's in `.gitignore`

`.env`, `.env.local`, `.env.*.local`, plus standard Next.js outputs and the Leash CLI cache. **`.env.local` is where your Anthropic + Leash API keys live during dev** — never commit it.

`.env.example` *is* committed. It's the contract.

## The CLI flow

| Command | What it does |
|---|---|
| `leash login` | Google OAuth; stores a token in your system keychain |
| `leash init --name daypilot` | Creates the server-side app row, writes `.leash/config.json` |
| `leash db shell daypilot` | Opens a `psql` session against the app's Postgres (after `leash deploy` provisions it) |
| `leash dev` | Starts `next dev` with secrets pulled from your dashboard |
| `leash deploy` | Builds + deploys; live at `daypilot-{username}.un.leash.build` |
| `leash secrets types` | Generates a TypeScript declaration that types `process.env` from `.env.example` |

For local dev daypilot uses `.env.local` directly (Next.js auto-loads it). `leash dev` is the alternative — useful once you've put the same values in dashboard secrets and want them injected from there.

## How the bound DB is used (and how to BYO)

Daypilot persists every generated plan to one table — schema: [`supabase/schema.sql`](./supabase/schema.sql). Helpers: [`src/lib/db.ts`](./src/lib/db.ts) — a singleton `pg.Pool` reading `process.env.DATABASE_URL`, plus `savePlan` and `recentPlans`.

For local dev you point `DATABASE_URL` at the Docker Postgres above. In production, `leash deploy` provisions a Leash-managed Postgres for the app and injects the connection string at runtime — no code changes.

To bring your own Postgres in production instead (Supabase project, RDS, Neon, etc.):

1. Uncomment `DATABASE_URL=` in `.env.example` and commit.
2. Set the connection string in your dashboard secrets.
3. Apply `supabase/schema.sql` to your DB out-of-band (`psql "$YOUR_URL" < supabase/schema.sql`).
4. `leash deploy` injects your `DATABASE_URL` like any other declared key.

`src/lib/db.ts` doesn't change — same code reads either source.

## Deploy

```bash
leash deploy
```

Builds the app, pushes the image, deploys to `daypilot-{your-username}.un.leash.build`. Provisioning a managed Postgres on first deploy is currently being worked on (see LEA-184); until that lands, deploy with the BYO-DB path above.

## What this *isn't*

This is the polished, productivity-focused example. If you need something that demonstrates wiring multiple integrations into your own server (without an AI layer), see [`leash-build/nextjs-with-integrations`](https://github.com/leash-build/nextjs-with-integrations) — it's the lower-level reference.

A second curated example focused on the **multi-database** pattern (BigQuery + production replica + bound local DB in one screen) is tracked in [LEA-182](https://linear.app/leashbuild/issue/LEA-182).

## License

MIT.
