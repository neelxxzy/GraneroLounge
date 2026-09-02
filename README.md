# Lounger Dashboard

Generate, display, and print weekly restaurant stock & operational notices for a lounge/kitchen environment.

Built with Next.js 14 (App Router, TypeScript), Tailwind CSS, and Prisma (SQLite by default, Postgres-ready).

## Features

- **`/admin`** — form for shift managers to enter the week's sales, stock, and focus figures on Mondays, with the week's date auto-suggested (next Monday after the last submitted report, or from today if there isn't one yet) and its display label generated automatically — no manual typing, with an "Edit" toggle for one-off cases like holiday weeks. Includes a live-computed preview of Sales Difference and Actual LFL %, one-click threshold presets (1.0% food / 0.6% drink), and Food/Drink Quality scores out of 5.
- **`/`** — high-contrast kitchen notice board view: LFL headline metric, sales breakdown, colour-coded stock variance badges, Food/Drink Quality badges, BOH/FOH focus grids, DOTW/BOTW cards, and a "Need to Know" announcement panel. A dropdown lets you switch between past weeks.
- **Print Notice Board** button — `@media print` rules hide all nav/buttons/inputs, force a single A4 portrait page, and keep badge backgrounds/colours crisp on paper.
- REST API under `/api/reports` for listing, creating, reading, updating, and deleting weekly reports.

## Getting started

```bash
npm install
cp .env.example .env   # already provided as .env, pointing at a local SQLite file
npx prisma db push     # creates dev.db with the WeeklyReport table
npm run db:seed        # optional: adds one example week of data
npm run dev
```

Visit:
- `http://localhost:3000/admin` to submit a weekly report
- `http://localhost:3000` to view the notice board (redirects to the most recent week)

## Switching to PostgreSQL

1. In `prisma/schema.prisma`, change the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update `DATABASE_URL` in `.env` to your Postgres connection string, e.g.
   `postgresql://user:password@localhost:5432/lounger`
3. Run `npx prisma db push` again.

## API routes

| Method | Route                  | Description                          |
|--------|-------------------------|--------------------------------------|
| GET    | `/api/reports`          | List all weekly reports (newest first) |
| POST   | `/api/reports`          | Create a new weekly report           |
| GET    | `/api/reports/latest`   | Fetch the most recent report         |
| GET    | `/api/reports/:id`      | Fetch a single report                |
| PUT    | `/api/reports/:id`      | Update a report                      |
| DELETE | `/api/reports/:id`      | Delete a report                      |

## Data model (`WeeklyReport`)

See `prisma/schema.prisma`. `bohFocus` and `fohFocus` are stored as JSON-encoded string arrays in SQLite (no native array column type) and are transparently parsed/serialized by `src/lib/types.ts` — the rest of the app only ever sees real `string[]`.

## Project structure

```
prisma/schema.prisma          WeeklyReport model
prisma/seed.ts                Example data seed
src/lib/prisma.ts             Prisma client singleton
src/lib/calculations.ts       Sales diff / LFL % / formatting helpers
src/lib/types.ts               DTO + JSON array (de)serialization
src/app/page.tsx              Notice board (dashboard) page
src/app/admin/page.tsx        Input form page
src/app/api/reports/**        REST API routes
src/components/Dashboard.tsx  Notice board layout
src/components/ReportForm.tsx Input form with live preview
src/components/StockBadge.tsx Green/red threshold badge
src/components/PrintButton.tsx
src/components/WeekSelector.tsx
src/app/globals.css           Tailwind + @media print rules
```
