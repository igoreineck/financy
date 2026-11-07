# Financy

Full-stack personal-finance app — final assignment for the Rocketseat
Pós-Tech program. Lets you register transactions and categories, log in with
email/password, view a monthly dashboard, and manage your own profile.

```
financy/
├── backend/    # GraphQL API (Node + Apollo + TypeGraphQL + Prisma + SQLite)
└── frontend/   # SPA (React 19 + Vite + Apollo Client + Tailwind v4)
```

## Screens

| Login | Sign up |
| --- | --- |
| ![Login](./frontend/docs/screenshots/01-login.png) | ![Sign up](./frontend/docs/screenshots/02-cadastro.png) |

| Dashboard | Transactions |
| --- | --- |
| ![Dashboard](./frontend/docs/screenshots/03-dashboard.png) | ![Transactions](./frontend/docs/screenshots/04-transacoes.png) |

| Categories | Profile |
| --- | --- |
| ![Categories](./frontend/docs/screenshots/05-categorias.png) | ![Profile](./frontend/docs/screenshots/06-perfil.png) |

## Quickstart

In two terminals, in this order:

```bash
# 1) backend
cd backend
pnpm install
cp .env.example .env                # set JWT_SECRET
pnpm migrate                        # creates ./dev.db
pnpm seed                           # populates 1 user + 10 categories + 69 transactions
pnpm dev                            # http://localhost:4000/graphql

# 2) frontend (in another terminal)
cd frontend
pnpm install
cp .env.example .env                # VITE_BACKEND_URL already points to :4000
pnpm codegen                        # generates src/gql/ from ../backend/schema.graphql
pnpm dev                            # http://localhost:5173
```

Test login (created by the seed):

- **email**: `conta@teste.com`
- **password**: `senha123`

## Per-package documentation

| Folder   | README                                       | CLAUDE.md                                    |
| -------- | -------------------------------------------- | -------------------------------------------- |
| Backend  | [`backend/README.md`](./backend/README.md)   | [`backend/CLAUDE.md`](./backend/CLAUDE.md)   |
| Frontend | [`frontend/README.md`](./frontend/README.md) | [`frontend/CLAUDE.md`](./frontend/CLAUDE.md) |

Each package also has a `docs/` folder with the detailed scope of each
(numbered) tarefa — useful for understanding the implementation decisions
tarefa by tarefa.

## Stack at a glance

- **Language**: TypeScript everywhere, ESM, `pnpm`.
- **Backend**: Node 20+, Apollo Server 5, TypeGraphQL, Prisma 6, SQLite,
  Express 5, JWT (HS256, 1 day).
- **Frontend**: React 19, Vite 7, Apollo Client 4, Tailwind CSS v4 with
  `@theme`, Zustand (persisted), React Hook Form + Zod, Radix UI, Lucide icons.
- **Quality**: Biome (lint + format), Vitest, MSW on the frontend, Prisma + a
  real DB on the backend.

## Implemented features

- Sign up and log in with email/password; JWT token in the `Authorization`
  header.
- Each user only sees and manages their own data (scoping enforced in the
  backend).
- Full CRUD for categories (name, color, icon, optional description).
- Full CRUD for transactions with filters (type, category, description) and
  client-side pagination.
- Dashboard with the current month's balance, income, and expenses, the 5 most
  recent transactions, and the top 5 most-used categories.
- Profile page with name editing (email locked) and a logout that clears the
  Apollo cache + store.
