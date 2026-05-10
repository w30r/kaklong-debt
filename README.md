# Kaklong Debt

A personal debt tracking application built with Next.js.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router)
- **Language:** TypeScript
- **UI:** React 19 + [shadcn/ui](https://ui.shadcn.com) with Tailwind CSS v4
- **Database:** MongoDB
- **Authentication:** Custom session-based auth
- **Icons:** Lucide React

## Getting Started

1. Clone the repo
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables in `.env.local` (see `.env.local` for required keys)
4. Run the dev server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

- `app/` — Next.js App Router pages, layouts, and API routes
- `components/` — shadcn/ui components
- `lib/` — database client and utility functions
- `middleware.ts` — Auth middleware