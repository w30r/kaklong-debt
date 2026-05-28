<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Kaklong Debt — agent guide

## Commands

| Command | What |
|---|---|
| `npm run dev` | Dev server on localhost:3000 |
| `npm run lint` | ESLint (whole project) |
| `npm run build` | Production build |
| `npm start` | Start production server |

No test framework or typecheck script is configured.

## Setup

- **MONGODB_URI** — MongoDB Atlas connection string (`.env.local`)
- **APP_PASSWORD** — if set, login is required; if empty/omitted, auth is bypassed

## Auth

Cookie-based (`kaklong-auth`), set via `app/auth-actions.ts`. Middleware (`middleware.ts`) protects `/` and `/debt/:path*`, redirects to `/login`. Not needed in dev if `APP_PASSWORD` is empty.

## Database

- **DB:** `kaklong-debt`, **Collections:** `debts`, `salary`
- Client: `lib/mongodb.ts` (singleton pattern, cached in dev via `globalThis`)
- Server actions: `app/actions.ts` (debt CRUD + salary CRUD)
- `ObjectId` → string conversion is done manually after every `find()`

## Key types

| File | Key type |
|---|---|
| `types/bank-debt.ts` | `BankDebt`, `Payment`, `calculateOutstanding()` |
| `types/salary.ts` | `SalaryEntry` |

- `BankDebt.nextPaymentDate` is an ISO date string or `"—"` (when paid off)
- `calculateOutstanding(debt)` computes overdue amount in RM

## Patterns

- Pages are **async server components** that call `getDebts()` / `getSalaryEntries()` directly
- Forms are **client components** wrapping server actions (actions use `FormData`)
- After mutations, `revalidatePath("/")` and optionally `revalidatePath("/debt/{id}")`
- `cn()` utility from `lib/utils.ts` for class merging (clsx + tailwind-merge)
- Path alias `@/` → project root (tsconfig path)

## UI

- **shadcn/ui** components in `components/ui/`
- **Tailwind CSS v4** (PostCSS config in `postcss.config.mjs`, using `@tailwindcss/postcss`)
- **Dark mode** default (`<html className="dark">`)
- Navigation: sidebar (`components/sidebar.tsx`) with Debt Tracker (`/`) and Salary Tracker (`/salary`) tabs
- Icons: Lucide React

## OpenCode MCP

A read-only MongoDB MCP server is configured in `opencode.json` — use the `MongoDB_*` tools to inspect data.

## Project layout

```
app/
  page.tsx              — dashboard (debt overview)
  layout.tsx            — root layout (dark mode, sidebar)
  actions.ts            — all server actions (debts + salary)
  auth-actions.ts       — login/logout actions
  debt-form.tsx         — add-debt form (client component)
  debt-table.tsx        — debt table (client component)
  debt/[id]/page.tsx    — debt detail page
  debt/[id]/edit-form.tsx — debt detail/edit form
  salary/               — salary tracker (same pattern as debts)
  login/                — login page
  api/                  — API routes
components/ui/          — shadcn/ui primitives
lib/
  mongodb.ts            — MongoClient singleton
  utils.ts              — cn() helper
types/
  bank-debt.ts          — BankDebt interface + calculateOutstanding()
  salary.ts             — SalaryEntry interface
