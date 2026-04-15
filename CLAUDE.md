# NBA Live Scoreboard

## Architecture

A real-time NBA scoreboard system spanning three platforms:

```
ESPN API
  ↓ polls every 30s
Railway Worker (apps/worker/)
  ↓ upserts scores
Supabase (Database + Auth + Realtime)
  ↓ pushes updates
Vercel Frontend (apps/web/)
  ↓ renders
Browser
```

### Frontend — `apps/web/` → Vercel
- Next.js with TypeScript, Tailwind CSS, App Router
- Supabase Auth (sign up, sign in, sign out)
- Favorites page: users pick teams to follow
- Scoreboard page: shows Live, Upcoming, Completed games
- Realtime subscriptions — scores update without polling or refresh

### Worker — `apps/worker/` → Railway
- Node.js background service
- Polls ESPN API every 30 seconds for NBA scoreboard data
- Parses game data (teams, scores, status, clock, logos)
- Upserts into Supabase `games` table
- Uses service role key (bypasses RLS — trusted infrastructure)

### Supabase
- **`games` table**: id, home_team, away_team, home_score, away_score, status, game_clock, home_logo, away_logo, updated_at
- **`favorites` table**: user_id, team_abbr (unique per user)
- **Auth**: email/password sign up and sign in
- **Realtime**: enabled on `games` table
- **RLS policies**:
  - `games` — readable by everyone
  - `favorites` — users can only read/write their own rows

## Monorepo Layout

```
nba-scoreboard/
  CLAUDE.md          ← this file
  apps/
    web/             ← Next.js frontend (→ Vercel)
    worker/          ← Background service (→ Railway)
```

## Environment Variables

### Frontend (`apps/web/.env.local`)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Worker (`apps/worker/.env`)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Commands

```bash
# Frontend
cd apps/web && npm run dev

# Worker
cd apps/worker && node index.js
```
