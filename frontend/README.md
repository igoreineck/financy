# Financy — Frontend

SPA em React 19 + Vite que consome a API GraphQL do `../backend`. Cobre auth
(login / cadastro), dashboard, CRUD de categorias e transações, e perfil do
usuário.

## Stack

- **React 19 + Vite 7** (sem framework).
- **Apollo Client 4** com `graphql-codegen` gerando tipos em `src/gql/`.
- **Tailwind CSS v4** com tokens em `@theme` (`src/index.css`).
- **Radix UI** para primitivos (Dialog, DropdownMenu, Select).
- **Zustand** com `persist` para a sessão (dual storage: local/session).
- **React Hook Form + Zod** para forms; parse on submit, sem `zodResolver`.
- **React Router 7** (`createBrowserRouter` + guards).
- **Vitest + MSW + Testing Library** para a bateria de testes.
- **Biome** para lint + format.

## Setup

```bash
pnpm install
cp .env.example .env                # ajuste VITE_BACKEND_URL se o backend não estiver em :4000
pnpm codegen                        # gera src/gql/ a partir de ../backend/schema.graphql
pnpm dev                            # http://localhost:5173
```

Se o backend estiver rodando com o seed aplicado (`cd ../backend && pnpm seed`),
você pode logar com:

- **e-mail**: `conta@teste.com`
- **senha**: `senha123`

## Comandos

| Comando                     | O que faz                                          |
| --------------------------- | -------------------------------------------------- |
| `pnpm dev`                  | Vite dev server em `:5173` (HMR)                   |
| `pnpm build`                | `tsc -b && vite build`                             |
| `pnpm preview`              | Serve `dist/` para smoke check                     |
| `pnpm test`                 | Roda todos os `*.spec.tsx`                         |
| `pnpm test:watch`           | Vitest em watch mode                               |
| `pnpm lint` / `pnpm format` | Biome sem / com autofix                            |
| `pnpm check`                | Biome lint + format autofix — antes de cada commit |
| `pnpm codegen`              | Regera `src/gql/` a partir do schema do backend    |
| `pnpm codegen:watch`        | Mesmo, em watch mode                               |

Não há script `type-check` separado — `pnpm build` roda `tsc -b`. Para checagem
rápida, `pnpm tsc --noEmit`.

## Estrutura

Detalhes completos (arquitetura, convenções, gotchas) em
[`CLAUDE.md`](./CLAUDE.md). Resumo:

```
src/
├── env.ts                 # env Zod-validado
├── lib/                   # apollo, auth (useLogout), format, initials, utils
├── store/                 # auth store (Zustand persist)
├── components/
│   ├── ui/                # primitivos shadcn-style (Radix + cva + cn)
│   ├── layout/            # AppLayout (navbar + outlet), UserMenu
│   └── guards/            # ProtectedRoute, PublicRoute
└── pages/
    ├── auth/              # login + sign-up
    ├── dashboard/         # stats + recentes + categorias
    ├── transactions/      # tabela + filtros + paginação + CRUD
    ├── categories/        # grid + CRUD + color/icon pickers
    └── profile/           # form (edita nome; e-mail bloqueado) + logout
```

Requisitos funcionais em [`requisitos.md`](./requisitos.md) (todos marcados).
