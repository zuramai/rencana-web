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

This repo is the **web client**: a client-only Nuxt 4 SPA (`ssr: false`) that talks to [`rencana-backend`](https://github.com/zuramai/rencana-backend) (Hono API). A Kotlin Multiplatform app lives in [`rencana-mobile`](https://github.com/zuramai/rencana-mobile).

Stack: Nuxt 4 + Nuxt UI 4, `@nuxtjs/i18n` (English, Bahasa Indonesia). Icons are bundled locally (no Iconify API calls).

Design source: `design/rencana.figcraft` (FigCraft), exported screens in `design/exports/`, mascot SVGs in `public/mascot/`.

## Setup

Prerequisites: Node ≥ 24.11 (`.nvmrc`), pnpm, and a running `rencana-backend` (dev: `http://localhost:8787`).

```bash
pnpm install
cp .env.example .env
pnpm dev                      # http://localhost:3000
```

### Environment

| Variable | Purpose |
| --- | --- |
| `NUXT_PUBLIC_API_BASE` | Base URL of `rencana-backend` (dev: `http://localhost:8787`). Required for `pnpm generate`. |

The backend must list this app's origin in its `WEB_ORIGINS`.

## Scripts

- `pnpm dev` / `pnpm preview`
- `NUXT_PUBLIC_API_BASE=https://api.example.com pnpm generate` — static build into `.output/public`, then `scripts/csp.mjs` injects a hash-based Content-Security-Policy `<meta>` into every HTML file
- `pnpm test` — unit tests (amount parsing, period labels)
- `pnpm typecheck`, `pnpm lint`

## Shared code

`shared/` mirrors `rencana-backend/src/shared`; change both.

## Deployment

The web app and the API must share a registrable domain (e.g. `app.example.com` + `api.example.com`). The session cookie is `SameSite=Strict`; on unrelated domains it is not sent and web login fails by design.

## Notes

- Itinerary times are wall-clock times at the destination (stored without time zone).
- Prices in other currencies are converted into the trip's budget currency with rates from [Frankfurter](https://frankfurter.dev), refreshed daily; each rate can be overridden per trip. Currencies Frankfurter doesn't cover need a manual rate and are flagged until set.
- The default currency of a new account comes from the browser time zone (Asia/Jakarta → IDR), falling back to the `Accept-Language` region, then USD.
- The backend re-encodes uploaded images to JPEG (max 2000 px) with a 480 px thumbnail; tickets also accept PDFs.
- PDF exports use Roboto; characters outside it (CJK, emoji, arrows) render blank.
