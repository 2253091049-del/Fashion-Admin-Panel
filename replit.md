# SD Fashion Dashboard

## Overview

A modern POS-style admin dashboard for SD Fashion, built as a pnpm workspace monorepo using TypeScript.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS (artifacts/sd-fashion)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Charts**: Recharts
- **Build**: esbuild (CJS bundle)

## Features

- **Dashboard**: Today Sales & This Month Sales summary cards, Monthly Sales Report with month picker, bar chart of monthly totals — all live from database
- **New Sale**: POS billing form with bill number, items (name/size/qty/rate/amount), receipt preview, saves to PostgreSQL
- **Sales History**: Paginated table of all saved sales with search and detail modal

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## API Endpoints

- `GET /api/sales` — list all sales (optional ?year=&month= filters)
- `POST /api/sales` — create a sale (saves to DB)
- `GET /api/sales/:id` — get single sale
- `DELETE /api/sales/:id` — delete a sale
- `GET /api/sales/summary/today` — today's total + count
- `GET /api/sales/summary/month` — this month's total + count
- `GET /api/sales/summary/monthly-totals` — 12-month chart data

## Database Tables

- `sales` — bill_no, date, customer, phone, note, payment_method, total
- `sale_items` — sale_id (FK), name, size, qty, rate, amount

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
