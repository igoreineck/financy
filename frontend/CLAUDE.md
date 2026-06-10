# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project context

`financy/frontend` is a Rocketseat Pós-Tech exercise — a React app that consumes the GraphQL API in `../backend/` to manage personal-finance transactions and categories with email/password auth. Functional requirements live in [`requisitos.md`](./requisitos.md) (10 checkboxes); the execution plan and per-task scope docs live in [`docs/`](./docs).

Two reference repositories shape this project:

- **Stack** — [`rocketseat-education/ftr-pos-360-mindshare/frontend`](https://github.com/rocketseat-education/ftr-pos-360-mindshare/tree/main/frontend). We mirror its Apollo Client 4 + Vite + shadcn-style primitives + Zustand wiring.
- **Code style / ergonomics** — [`igoreineck/brev.ly/web`](https://github.com/igoreineck/brev.ly/tree/main/web). Written by the project owner. We adopt its conventions: kebab-case filenames, React Hook Form + Zod, Tailwind v4 `@theme`, Zod-validated env, `@/*` path alias, Biome (single quotes, no semis), Vitest.

When the two references conflict on style, **brev.ly wins**.

The backend lives in `../backend/`. Its GraphQL schema (`../backend/schema.graphql`) is the single source of truth — `graphql-codegen` reads it to generate typed documents into `src/gql/` (gitignored).

## Current state

Scaffolding is done (tarefa 00, merged). The app boots, renders a "Financy" placeholder, and has Apollo + Zustand + router + Vitest + MSW wired empty. Remaining work is tracked in [`docs/`](./docs) as 6 sequential tarefas (01 → 06), each its own branch + draft PR + review + merge cycle.

Build order:

```
00 → 01 → 02 → 03 → 04 → 05 → 06
```

Each tarefa assumes everything before it is merged on `main`.

| # | Doc | Scope |
| - | --- | ----- |
| 00 | [`docs/00-scaffolding.md`](./docs/00-scaffolding.md) | Vite + deps + Apollo + tooling (done) |
| 01 | [`docs/01-design-system.md`](./docs/01-design-system.md) | Tokens em `@theme` + primitivos em `src/components/ui/` |
| 02 | [`docs/02-auth.md`](./docs/02-auth.md) | Login + cadastro + auth store + route guards |
| 03 | [`docs/03-categorias-crud.md`](./docs/03-categorias-crud.md) | Categorias: list + CRUD |
| 04 | [`docs/04-transacoes-crud.md`](./docs/04-transacoes-crud.md) | Transações: tabela + filtros + paginação + CRUD |
| 05 | [`docs/05-dashboard.md`](./docs/05-dashboard.md) | Dashboard: stats + recentes + sumário |
| 06 | [`docs/06-perfil-logout.md`](./docs/06-perfil-logout.md) | Perfil + user-menu + logout |

## Workflow per tarefa

Every tarefa is a self-contained branch, draft PR, review, merge cycle. The user reviews and merges; never push directly to `main`.

```bash
# 1. Branch from latest main
git checkout main && git pull --ff-only
git checkout -b feat/NN-slug                    # e.g. feat/01-design-system

# 2. Implement following docs/NN-*.md. Write tests alongside source as *.spec.tsx.

# 3. Mark progress in the same PR (don't leave for a follow-up):
#    - Check off Testing + Acceptance criteria bullets in docs/NN-*.md.
#    - Check off matching lines in requisitos.md (Tarefas section), when applicable.

# 4. Verify locally before pushing
pnpm check                                       # Biome lint + format autofix
pnpm tsc --noEmit                                # type check
pnpm test                                        # all vitest specs pass

# 5. Commit and push (terse subject in English — no `feat:` prefix, no tarefa number, no Claude attribution)
git add .
git commit -m "<short English summary>"
git push -u origin feat/NN-slug

# 6. Open a draft PR — always use the gh CLI, never the GitHub web UI.
#    PR title and body are written in English. User-facing strings inside the
#    code diff stay in Portuguese, but the PR copy itself is always English.
gh pr create --draft \
  --title "<short English title>" \
  --body "$(cat <<'EOF'
Closes the scope in `docs/NN-<slug>.md`.

## Summary
- <bullet>

## Test plan
- [ ] manual: <how to exercise the feature in the browser>
- [ ] automated: `pnpm test` (covers the new `*.spec.tsx`)
EOF
)"
```

The user reviews, marks the PR ready, and merges. Then start the next tarefa from a fresh `main`.

Use `gh` for all GitHub interactions — PRs, comments, checks, issues.

## Commands

Package manager is **pnpm**. Local `.env` must exist (gitignored) — copy from `.env.example` and adjust `VITE_API_URL` if needed.

| Command | What it does |
| ------- | ------------ |
| `pnpm dev` | Vite dev server on `http://localhost:5173` (HMR) |
| `pnpm build` | `tsc -b && vite build` — type-check + production bundle to `dist/` |
| `pnpm preview` | Serves the built `dist/` for a smoke check |
| `pnpm test` | `vitest run` — runs all `*.spec.tsx` once |
| `pnpm test:watch` | `vitest` in watch mode |
| `pnpm lint` | Biome lint (no fixes) |
| `pnpm format` | Biome format with autofix |
| `pnpm check` | Biome lint **and** format with autofix — run before every commit |
| `pnpm codegen` | `graphql-codegen` reads `../backend/schema.graphql` + `.tsx/.ts` documents → regenerates `src/gql/` |
| `pnpm codegen:watch` | Same, watch mode (run alongside `pnpm dev` when iterating on queries) |

There's no separate type-check script — `pnpm build` runs `tsc -b` for you. For a faster standalone check use `pnpm tsc --noEmit`.

End-to-end smoke (with backend running on `:4000`):

```bash
# from ../backend
pnpm dev                                          # boots Apollo + Express
# from here
pnpm codegen                                      # generates src/gql/ from schema
pnpm dev                                          # http://localhost:5173
```

## Mandatory constraints (from `requisitos.md`)

- Stack: **TypeScript + React + Vite + GraphQL**. Apollo Client is fixed (mirrors the reference repo).
- Layout must follow the Figma as closely as possible (file key `Ix1zaJNlMOhIRHUxaqhmo8`; Style Guide `node-id=3-377`, prototypes `node-id=3-376`).
- `.env.example` documents every var. The assignment names the env var `VITE_BACKEND_URL` but the codebase already standardized on `VITE_API_URL` (consumed by `src/env.ts` + `src/lib/apollo.ts`) — keep using `VITE_API_URL`.
- Users only see and manage their own data. The frontend trusts the backend to scope by user, but never sends another user's id and never caches across sessions; logout clears the persisted store.

## Code style (Biome-enforced)

Biome is the single source of truth — config at `biome.json`. Run `pnpm check` to autofix. Notable rules:

- **Single quotes**, **no semicolons** (asNeeded). **JSX uses double quotes** (`jsxQuoteStyle: "double"`).
- **2-space indent**, **80-char line width**.
- **Arrow parens** only when required.
- **Trailing commas** everywhere multi-line allows them.
- **`useImportType`** — value-only imports must use `import type` when used purely as types.
- **`useNodejsImportProtocol`** — built-in Node modules use `node:` prefix (`node:path`).
- **`noExplicitAny`** is an error.
- Import order: Biome auto-organizes (external first, then `@/*` aliased, then relative).
- `src/gql/` is ignored — it's generated, don't lint or commit it.

Conventions Biome can't enforce:

- **Filenames are kebab-case**: `transaction-form.tsx`, `category-list.tsx`. Test files are `*.spec.tsx` colocated next to source.
- **Functional components, named exports** everywhere. No default exports.
- **`@/*` alias** for any cross-folder import inside `src/`. Avoid `../../`.
- **Portuguese only in user-facing strings** — labels, button text, error messages rendered to the user. **Everything else is English**: code, comments, commits, PR descriptions, test names (`describe`/`it`), variable names, internal types. Test assertions that quote a thrown error keep the Portuguese inside the quoted string, but the `it(...)` description itself stays English.
- **Tailwind classes**: prefer tokens from `@theme` (e.g. `bg-brand-base`, `text-gray-500`) over raw hexes. Combine classes via `cn()` from `@/lib/utils`.

## Architecture

- **Bundler**: Vite 7 (no framework). React plugin + `@tailwindcss/vite`. Alias `@` → `./src` in `vite.config.ts` and `vitest.config.ts`.
- **UI**: React 19 + Tailwind CSS v4 (`@import "tailwindcss"` + `@theme` in `src/index.css`). Primitives in `src/components/ui/` are shadcn-style (Radix + `cn()` + `cva` when variants exist). Icons from `lucide-react`.
- **Forms**: React Hook Form for state, Zod for the schema. Parse on submit (no `zodResolver`) — keeps the schema independent and testable.
- **Routing**: React Router 7 via `createBrowserRouter` in `src/routes.tsx`. `<ProtectedRoute>` / `<PublicRoute>` wrappers gate by `useAuthStore.isAuthenticated` (added in tarefa 02).
- **GraphQL**: Apollo Client 4 (`src/lib/apollo.ts`). Queries/mutations live next to the components that use them (inline `gql\`\`` or `.graphql` files), and `graphql-codegen` generates typed documents into `src/gql/`. Always use the generated `TypedDocumentNode` — never call `useQuery<T>()` with a hand-typed generic.
- **Auth state**: Zustand store at `src/store/auth.ts` with `persist` middleware (key `'financy-auth'`). Shape: `{ token, user, isAuthenticated, setSession, logout }`. The Apollo `authLink` reads `token` from the store on every request (wired in tarefa 02).
- **Env**: `src/env.ts` parses `import.meta.env` through a Zod schema at module load. Missing/invalid vars crash at boot.
- **Toasts**: `sonner` (added in tarefa 01 with the `<Toaster>` primitive).
- **Module system**: `"type": "module"`, ESM. With `moduleResolution: bundler`, you do **not** need `.js` extensions on relative imports.

## Directory layout

```
frontend/
├── docs/                              # per-tarefa scope docs (00..06)
├── src/
│   ├── env.ts                         # Zod-parsed env (single source of truth)
│   ├── main.tsx                       # createRoot → <App />
│   ├── App.tsx                        # ApolloProvider + RouterProvider (+ Toaster)
│   ├── routes.tsx                     # createBrowserRouter
│   ├── index.css                      # @import "tailwindcss" + @theme tokens
│   ├── gql/                           # generated — DO NOT edit, DO NOT commit
│   ├── lib/
│   │   ├── apollo.ts                  # ApolloClient singleton (+ authLink in 02)
│   │   └── utils.ts                   # cn() helper
│   ├── store/
│   │   └── auth.ts                    # Zustand auth store (persist)
│   ├── components/
│   │   ├── ui/                        # primitives — button, input, dialog, ... (tarefa 01)
│   │   └── common/                    # logo, app-shell, ... (tarefa 01+)
│   ├── pages/                         # route components (tarefa 02+)
│   │   ├── auth/                      # sign-in.tsx, sign-up.tsx
│   │   ├── dashboard/
│   │   ├── categories/
│   │   ├── transactions/
│   │   └── profile/
│   └── test/
│       ├── setup.ts                   # vitest global setup (jest-dom + MSW lifecycle)
│       ├── render.tsx                 # renderWithProviders helper
│       └── msw/
│           ├── server.ts              # setupServer(...handlers)
│           └── handlers.ts            # GraphQL handlers (extended per tarefa)
├── biome.json
├── codegen.ts
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json + tsconfig.app.json + tsconfig.node.json
├── package.json
├── .env.example
├── index.html
└── requisitos.md
```

## Testing

Runner: **Vitest** with `jsdom`, globals enabled, setup at `src/test/setup.ts`. Provider wrapping comes from `renderWithProviders` in `src/test/render.tsx` (Apollo + MemoryRouter). MSW intercepts network calls — handlers live in `src/test/msw/handlers.ts` and tests can override per-spec via `server.use(...)`.

`vitest.config.ts` injects `VITE_API_URL=http://localhost:4000/graphql` so the Zod env schema parses cleanly without a real `.env`.

**Every tarefa ships tests proportional to its scope.** Use this hierarchy:

1. **Primitive / component tests** — render via `@testing-library/react`, interact via `@testing-library/user-event`, assert via `@testing-library/jest-dom` matchers. Cover variants, disabled state, keyboard/ARIA where it matters.
2. **Page / flow tests** — `renderWithProviders` + MSW handler for the GraphQL operation. Cover the happy path, a validation error, and a backend-error toast. Use `screen.findBy*` for async UI.
3. **Auth guard tests** — `<ProtectedRoute>` redirects when `isAuthenticated=false`; `<PublicRoute>` redirects to `/` when authenticated. Tarefa 02 introduces these.

**Choose tests by realism, not by checklist.** Add a case when a real user could plausibly hit it (submitting an empty form, the backend returning `Categoria já existe`, navigating away mid-mutation, logging out then back in). Skip contrived permutations unless the code actually branches on them. When a doc's listed cases feel thin, extend them — but only with cases that pull their weight.

Run `pnpm test` before every commit.

## GraphQL workflow

1. Write the operation inline next to the component:

   ```ts
   const ListCategoriesQuery = gql(`
     query ListCategories {
       listCategories { id name color icon }
     }
   `)
   ```

   (The `gql` import comes from `@/gql` — it's the codegen-generated `gql` tag, not `graphql-tag`.)
2. Run `pnpm codegen` (or `pnpm codegen:watch` alongside `pnpm dev`). The watcher regenerates `src/gql/graphql.ts` when documents change.
3. Use the typed document directly with Apollo hooks — no manual generics:

   ```ts
   const { data, loading, error } = useQuery(ListCategoriesQuery)
   ```

Never edit `src/gql/`. Never commit it (it's in `.gitignore`). If a teammate's schema change breaks codegen, the right fix is in the schema or the query — not in the generated file.

## Error handling

- Apollo errors surface via `useMutation`/`useQuery`'s `error` object. Show them to the user as `sonner` toasts; the backend already writes Portuguese error messages.
- For validation, Zod's `safeParse` returns `error.issues[]` — map `issues[0].message` next to the field, or to a toast if it's a global error.
- Never `console.error(err)` in production paths. Bubble the message up; the toast is the user-facing log.
- 401-equivalent (`Não autenticado`/invalid token) responses should clear the auth store and redirect to `/`. Implementation lands with the Apollo `errorLink` in tarefa 02.

## Validation

- Zod schemas live next to the form they validate (e.g. `pages/auth/sign-in.schema.ts`). One schema per form; export the inferred type for the component.
- Don't enable `zodResolver` from `@hookform/resolvers` — parse on submit. Keeps the schema reusable outside RHF (e.g. in tests).
- `src/env.ts` validates env vars with Zod at boot — that's already in place.

## Gotchas

- **`src/gql/` is gitignored.** A fresh clone won't typecheck until you run `pnpm codegen`. The codegen also fails if the backend schema file is missing — keep `../backend/schema.graphql` in sync (it's committed in the backend repo).
- **Tailwind v4** uses `@theme` in CSS for tokens (not `tailwind.config.js`). Adding a new color/font/radius means editing `src/index.css`, not a config file.
- **`@apollo/client/react`** is the React entry point in Apollo 4 (`ApolloProvider`, `useQuery`). The bare `@apollo/client` exports the client class. Don't mix them up.
- **React Router 7** exports `RouterProvider` from `react-router/dom` (not `react-router-dom`). Imports look unusual but match the v7 API.
- **`useAuthStore` is persisted.** When clearing for a logout test, prefer `useAuthStore.getState().logout()` over manipulating `localStorage` directly.
- **Money is stored as integer cents** in the backend (`amount: Int!`). Format for display with `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` — divide by 100 first. When sending, multiply by 100 and `Math.round` to integer.
- **`onDelete: Restrict` on categories** — deleting a category that still has transactions throws on the backend. Surface the error as a toast; don't try to pre-check on the frontend.
- **Refresh token rotation is not supported.** The token lives for 1 day; when it expires the user re-logs in. Don't build a refresh flow.
