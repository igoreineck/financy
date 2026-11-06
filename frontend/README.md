# Financy — Frontend

React 19 + Vite SPA that consumes the GraphQL API from `../backend`. Covers
auth (login / sign-up), dashboard, CRUD for categories and transactions, and
the user profile.

## Stack

- **React 19 + Vite 7** (no framework).
- **Apollo Client 4** with `graphql-codegen` generating types into `src/gql/`.
- **Tailwind CSS v4** with tokens in `@theme` (`src/index.css`).
- **Radix UI** for primitives (Dialog, DropdownMenu, Select).
- **Zustand** with `persist` for the session (dual storage: local/session).
- **React Hook Form + Zod** for forms; parse on submit, no `zodResolver`.
- **React Router 7** (`createBrowserRouter` + guards).
- **Vitest + MSW + Testing Library** for the test suite.
- **Biome** for lint + format.

## Setup

```bash
pnpm install
cp .env.example .env                # adjust VITE_BACKEND_URL if the backend isn't on :4000
pnpm codegen                        # generates src/gql/ from ../backend/schema.graphql
pnpm dev                            # http://localhost:5173
```

If the backend is running with the seed applied (`cd ../backend && pnpm seed`),
you can log in with:

- **email**: `conta@teste.com`
- **password**: `senha123`

## Commands

| Command                     | What it does                                       |
| --------------------------- | -------------------------------------------------- |
| `pnpm dev`                  | Vite dev server on `:5173` (HMR)                   |
| `pnpm build`                | `tsc -b && vite build`                             |
| `pnpm preview`              | Serves `dist/` for a smoke check                   |
| `pnpm test`                 | Runs every `*.spec.tsx`                            |
| `pnpm test:watch`           | Vitest in watch mode                               |
| `pnpm lint` / `pnpm format` | Biome without / with autofix                       |
| `pnpm check`                | Biome lint + format autofix — before every commit  |
| `pnpm codegen`              | Regenerates `src/gql/` from the backend schema     |
| `pnpm codegen:watch`        | Same, in watch mode                                |

There's no separate `type-check` script — `pnpm build` runs `tsc -b`. For a
quick check, use `pnpm tsc --noEmit`.

## Structure

Full details (architecture, conventions, gotchas) in
[`CLAUDE.md`](./CLAUDE.md). Summary:

```
src/
├── env.ts                 # Zod-validated env
├── lib/                   # apollo, auth (useLogout), format, initials, utils
├── store/                 # auth store (Zustand persist)
├── components/
│   ├── ui/                # shadcn-style primitives (Radix + cva + cn)
│   ├── layout/            # AppLayout (navbar + outlet), UserMenu
│   └── guards/            # ProtectedRoute, PublicRoute
└── pages/
    ├── auth/              # login + sign-up
    ├── dashboard/         # stats + recent + categories
    ├── transactions/      # table + filters + pagination + CRUD
    ├── categories/        # grid + CRUD + color/icon pickers
    └── profile/           # form (edits name; email locked) + logout
```

Functional requirements in [`requisitos.md`](./requisitos.md) (all checked).
