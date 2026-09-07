# Leadspot CRM

A lightweight sales CRM for tracking leads, working the pipeline, and
seeing how the business is doing at a glance.

## Features

- **Leads** — a searchable, filterable table of every lead (stage, source,
  owner, deal value). Click a row to edit, or add a new lead from scratch.
- **Pipeline** — a drag-and-drop kanban board across all seven stages
  (New → Contacted → Qualified → Proposal → Negotiation → Won/Lost), with
  per-column totals.
- **Analytics** — KPIs (open pipeline value, win rate, avg. deal size),
  a pipeline funnel, lead source breakdown, a monthly trend line, a won/open/lost
  split, and a rep leaderboard.

## Data

The app seeds itself with ~68 realistic mock leads on first load and then
persists all changes to the browser's `localStorage` — no backend required.
Reload the page and your edits are still there. To wipe the data and start
over, clear the `leadspot-crm-data` key in your browser's dev tools
(Application → Local Storage), or run `localStorage.clear()` in the console.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- Zustand (state + localStorage persistence)
- Recharts (charts)
- React Router (hash-based, so it works from a static file host with no
  server-side routing config)

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL. To produce a production build:

```bash
npm run build
npm run preview
```

`npm run build` outputs a static `dist/` folder — this app has no backend,
so it can be deployed as-is to any static host (Vercel, Netlify, GitHub
Pages, S3, etc.) once you're ready to put it online.
