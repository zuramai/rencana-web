# Rencana

<p align="center">
  <img src="public/mascot/wave.svg" width="120" alt="Koper the suitcase waving">
</p>

<p align="center">
  <img src="design/exports/03%20Travel%20list.png" width="260" alt="Trip list">
  <img src="design/exports/06%20Plan%20detail%20itinerary.png" width="260" alt="Plan itinerary">
  <img src="design/exports/09%20Costs%20tab.png" width="260" alt="Budget and costs">
</p>

Mobile-first travel & budget planner with Koper the suitcase. Plan trips (itinerary, other expected costs, tickets), see the budget in your trip currency, and export everything as PDF or Excel. The **Budget** menu is a placeholder for now.

Stack: Nuxt 4 + Nuxt UI 4, `nuxt-auth-utils` (username/password + Google), `@nuxtjs/i18n` (English, Bahasa Indonesia), Drizzle ORM on PostgreSQL, S3-compatible storage (MinIO in dev), pdfmake / exceljs / pdf-lib for exports.

Design source: `design/rencana.figcraft` (FigCraft), exported screens in `design/exports/`, mascot SVGs in `public/mascot/`.

## Setup

Requires Node ≥ 24.11 (`.nvmrc`), pnpm, PostgreSQL and an S3-compatible bucket.

```bash
pnpm install
cp .env.example .env          # fill in values (see below)

# PostgreSQL (Homebrew)
brew services start postgresql@16
createdb rencana
pnpm db:migrate

# MinIO for local uploads (port 9000 is often taken, so .env.example uses 9100)
brew install minio
minio server ~/.local/share/rencana-minio --address 127.0.0.1:9100 --console-address 127.0.0.1:9101
pnpm s3:init                  # creates the bucket if missing

pnpm dev
```

### Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `NUXT_APP_SECRET` | ≥ 32 chars, seals session cookies (generated automatically in dev, required in production) |
| `NUXT_OAUTH_GOOGLE_CLIENT_ID` / `_SECRET` / `_REDIRECT_URL` | Google sign-in (optional; redirect URL is `<origin>/auth/google`) |
| `NUXT_S3_ENDPOINT`, `NUXT_S3_REGION`, `NUXT_S3_BUCKET`, `NUXT_S3_ACCESS_KEY_ID`, `NUXT_S3_SECRET_ACCESS_KEY`, `NUXT_S3_FORCE_PATH_STYLE` | Upload storage (MinIO, R2, S3, …) |

## Scripts

- `pnpm dev` / `pnpm build` / `pnpm preview`
- `pnpm db:generate` — new migration from `server/db/schema.ts`; `pnpm db:migrate` — apply migrations
- `pnpm s3:init` — ensure the bucket exists
- `pnpm test` — unit tests (budget maths, period labels, amount parsing)
- `pnpm typecheck`, `pnpm lint`

## Notes

- Itinerary times are wall-clock times at the destination (stored without time zone).
- Prices in other currencies are converted into the trip's budget currency with rates from [Frankfurter](https://frankfurter.dev), refreshed daily; each rate can be overridden per trip. Currencies Frankfurter doesn't cover need a manual rate and are flagged until set.
- The default currency of a new account comes from the browser time zone (Asia/Jakarta → IDR), falling back to the `Accept-Language` region, then USD.
- Uploaded images are re-encoded to JPEG (max 2000 px) with a 480 px thumbnail; HEIC isn't supported. Tickets also accept PDFs.
- PDF exports use Roboto; characters outside it (CJK, emoji, arrows) render blank.
