# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project context

`financy/backend` is a Rocketseat Pós-Tech exercise — a personal-finance API for user-scoped transactions and categories with email/password auth. The frontend lives in `../frontend/` (Vite + React + GraphQL).

Two reference repositories shape this project:

- **Architecture / stack** — [`rocketseat-education/ftr-pos-360-mindshare/backend`](https://github.com/rocketseat-education/ftr-pos-360-mindshare/tree/main/backend). We mirror its Apollo + Express + TypeGraphQL + Prisma wiring (no choice — the assignment mandates this stack).
- **Code style / ergonomics** — [`igoreineck/brev.ly/server`](https://github.com/igoreineck/brev.ly/tree/main/server). Written by the project owner. We adopt its conventions: function-based domain logic, kebab-case files, colocated `.spec.ts`, Biome (single quotes, no semis), strict TS, `@/*` path alias, Zod-validated env, Vitest.

When the two references conflict on style, **brev.ly wins**.

## Current state

All 10 tarefas are merged on `main`. The API exposes:

- `register` / `login` / `me` / `updateProfile` (auth + profile editing).
- `listCategories` / `category` / `createCategory` / `updateCategory` /
  `deleteCategory` (full CRUD; delete blocks if the category still has
  transactions because of `onDelete: Restrict`).
- `listTransactions` / `transaction` / `createTransaction` /
  `updateTransaction` / `deleteTransaction`.

Tarefa scope docs in `docs/` (numbered 01..10) reflect shipped state. Each is
defended by a unit suite in `src/app/...spec.ts` and an integration suite
through `ApolloServer.executeOperation` in `src/graphql/resolvers/*.spec.ts`.

`prisma/seed.ts` populates a demo user (`conta@teste.com` / `senha123`), 10
categorias, and ~70 transações spread across 5 months — handy for the frontend's
dashboard, filters, and pagination.

Design decisions (money as `Int` cents, `TransactionType` enum stored as
`String` because SQLite lacks native enums, `onDelete: Restrict` for category
deletions, `{ token, user }` auth response, no refresh-token rotation) are
codified in the resolvers and tests; revisit them only when a hard requirement
forces a change.

## Workflow per tarefa

Every tarefa is a self-contained branch, draft PR, review, merge cycle. The user reviews and merges; never push directly to `main` for a tarefa.

```bash
# 1. Branch from latest main
git checkout main && git pull --ff-only
git checkout -b feat/NN-slug                    # e.g. feat/01-criar-conta-e-login

# 2. Implement following the doc in docs/NN-*.md.
#    Write tests alongside source as *.spec.ts.

# 3. Mark progress — part of the PR, not a follow-up
#    - Check off each satisfied bullet in docs/NN-*.md (Testing + Acceptance criteria).
#    - Check off the matching `- [ ]` line in requisitos.md (Tarefas section).
#    This keeps overall progress visible at a glance from the repo root.

# 4. Verify locally before pushing
pnpm check                                       # Biome lint + format autofix
npx tsc --noEmit                                 # type check
pnpm test                                        # all vitest specs pass

# 5. Commit and push (terse English subject, no `feat:` prefix, no tarefa number, no Claude attribution)
git add .
git commit -m "<short English summary>"
git push -u origin feat/NN-slug

# 6. Open a draft PR — always use the gh CLI, never the GitHub web UI
gh pr create --draft \
  --title "<short English title>" \
  --body "$(cat <<'EOF'
Closes the scope in `docs/NN-<slug>.md`.

## Summary
- <bullet>

## Test plan
- [ ] manual: <how to exercise the feature in GraphQL Sandbox>
- [ ] automated: `pnpm test` (see new `*.spec.ts` files)
EOF
)"
```

The user reviews, marks the PR ready, and merges. Then start the next tarefa from a fresh `main`.

Use `gh` for all GitHub interactions — PRs, comments, checks, issues. Never paste URLs into a browser when `gh` can do it.

## Commands

Package manager is **pnpm**. Local `.env` must exist (gitignored) — copy from `.env.example` and set `JWT_SECRET`.

| Command | What it does |
|---------|--------------|
| `pnpm dev` | `tsx watch --env-file=.env src/infra/http/server.ts` — boots Apollo + Express on `http://localhost:4000/graphql` |
| `pnpm test` | `dotenv -e .env.test -- vitest run` — runs all `*.spec.ts` against `file:./test.db` |
| `pnpm test:watch` | same as above, watch mode |
| `pnpm test:reset` | drops & re-migrates the test DB (useful if migrations get tangled) |
| `pnpm lint` | Biome lint (no fixes) |
| `pnpm format` | Biome format with autofix |
| `pnpm check` | Biome lint **and** format with autofix — run before every commit |
| `pnpm migrate` | `prisma migrate dev` — pass `--name <slug>` for new migrations |
| `pnpm generate` | `prisma generate` — regenerates client without migrating |
| `pnpm seed` | `tsx --env-file=.env prisma/seed.ts` — wipes the seed user's data and re-creates 10 categorias + ~70 transações |
| `pnpm export-schema` | Build the GraphQL schema and write `./schema.graphql` (consumed by the frontend's codegen) |

There is no `build`/`start` yet — the assignment doesn't require a prod build. Add `tsup` later if needed.

Smoke check while dev is running:
```bash
curl -s -X POST http://localhost:4000/graphql \
  -H 'content-type: application/json' \
  -d '{"query":"{ __typename }"}'
# → {"data":{"__typename":"Query"}}
```

After changing the GraphQL surface (a resolver, an `@InputType`, an
`@ObjectType`, an enum), run `pnpm export-schema` so `./schema.graphql` is up to
date for the frontend's `pnpm codegen`. The schema file is checked into git on
purpose — the frontend can typecheck without running the backend.

## Mandatory constraints (from `requisitos.md`)

- Stack: **TypeScript + GraphQL + Prisma + SQLite**. Postgres is the only allowed alternative DB.
- **Per-user scoping** is non-negotiable. Every resolver that touches `Category` or `Transaction` applies `@UseMiddleware(IsAuth)` and every Prisma call includes `where: { ..., userId: user.id }`. See `docs/02-escopo-por-usuario.md` for the invariant and IDOR pitfalls.
- CORS enabled. Origin from `env.CORS_ORIGIN` (default `http://localhost:5173`).
- `.env.example` documents every var.

## Code style (Biome-enforced)

Biome is the single source of truth — config at `biome.json`. Run `pnpm check` to autofix. Notable rules:

- **Single quotes**, **no semicolons** (asNeeded — only where ASI would break).
- **2-space indent**, **80-char line width**.
- **Arrow parens** only when required.
- **Trailing commas** everywhere multi-line allows them.
- **`useImportType`** — value-only imports must use `import type` when used purely as types.
- **`useNodejsImportProtocol`** — built-in Node modules use `node:` prefix (`node:child_process`, not `child_process`).
- **`noExplicitAny`** is an error.
- Import order: Biome auto-organizes (external first, then `@/*` aliased, then relative).

Conventions Biome can't enforce:

- **Filenames are kebab-case**: `create-category.ts`, `auth.resolver.ts`. Test files are `*.spec.ts` colocated next to source.
- **Functions over classes for domain logic** in `src/app/`. TypeGraphQL forces classes for `@Resolver`, `@ObjectType`, `@InputType` — that's fine. Plain business logic isn't class-based.
- **Named exports** everywhere. No default exports.
- **Portuguese only in user-facing strings** — error messages thrown by `src/app/...` functions, and any literal the frontend will render. **Everything else is English**: code, comments, commits, PR descriptions, test names (`describe`/`it`), variable names, internal types. Test assertions that quote a thrown error keep the Portuguese inside the quoted string, but the `it(...)` description itself stays English.

## Architecture

- **HTTP**: `express` 5 + `cors`.
- **GraphQL server**: `@apollo/server` 5 on Express via `@as-integrations/express5`.
- **Schema**: `type-graphql` decorator-based. `reflect-metadata` is the very first import in `src/infra/http/server.ts`. `experimentalDecorators` + `emitDecoratorMetadata` are on in `tsconfig.json`.
- **ORM**: `@prisma/client` 6 against SQLite at `file:./dev.db`. Client singleton lives at `src/infra/db/prisma.ts` (uses `globalThis` so `tsx watch` reloads don't open new connections).
- **Env**: `src/env.ts` parses `process.env` through a Zod schema at module load. Importing `env` is type-safe; missing vars crash at boot, not at first use.
- **Auth (per `docs/01`)**: `register`/`login` issue a 1-day JWT signed with `env.JWT_SECRET`. `buildContext` reads `Authorization: Bearer <token>`, verifies via `jsonwebtoken`, exposes `{ user: id }`. `IsAuth` middleware rejects unauthenticated calls; `@GqlUser()` parameter decorator re-fetches the full `User` from Prisma in resolvers that need the row.
- **Module system**: `"type": "module"`, ESM. With `moduleResolution: bundler`, you do **not** need `.js` extensions on relative imports — `tsx` and Vitest handle this.

## Directory layout

```
backend/
├── prisma/
│   ├── schema.prisma                 # User, Category, Transaction
│   ├── migrations/                   # generated by `pnpm migrate`
│   └── seed.ts                       # demo user + 10 categorias + ~70 transações
├── src/
│   ├── env.ts                        # Zod-parsed env (single source of truth)
│   ├── infra/
│   │   ├── http/server.ts            # Apollo + Express bootstrap
│   │   └── db/prisma.ts              # PrismaClient singleton
│   ├── graphql/                      # TypeGraphQL surface (classes — framework requirement)
│   │   ├── context.ts                # buildContext (JWT → user id)
│   │   ├── decorators/gql-user.decorator.ts
│   │   ├── middlewares/is-auth.middleware.ts
│   │   ├── models/                   # @ObjectType domain models
│   │   ├── inputs/                   # @InputType DTOs
│   │   ├── outputs/                  # @ObjectType output DTOs
│   │   └── resolvers/                # @Resolver classes (auth, category, transaction)
│   ├── app/                          # business logic (function-based, brev.ly-style)
│   │   ├── auth/                     # register-user, login-user, update-profile
│   │   ├── categories/               # create-category, list-categories, get-category, ...
│   │   └── transactions/             # create-transaction, list-transactions, ...
│   ├── shared/
│   │   ├── hash.ts                   # bcrypt wrappers
│   │   └── jwt.ts                    # sign/verify wrappers
│   ├── scripts/export-schema.ts      # writes ./schema.graphql from buildSchema()
│   └── test/setup.ts                 # vitest global setup — migrates test DB and wipes between tests
├── docs/                             # one markdown spec per tarefa (01..10)
├── schema.graphql                    # exported schema — consumed by the frontend
├── biome.json
├── vitest.config.ts
├── tsconfig.json
├── package.json
├── .env.example
└── .env.test                         # test-only env, committed (no secrets)
```

## Testing

`vitest` is the runner — config at `vitest.config.ts`. It uses a `forks` pool with `singleFork: true` so all tests share one process and one DB connection, with `src/test/setup.ts` running `prisma migrate deploy` against `file:./test.db` and wiping user-owned rows between tests.

**Every tarefa ships three layers of tests.** None is optional.

1. **Unit tests for `src/app/...` functions.** Colocated as `*.spec.ts`. Hit the real Prisma client against the test DB. Cover the happy path, validation failures, and — for any function that mutates user data — at least one cross-user authorization assertion.
2. **Integration tests for GraphQL resolvers.** Colocated next to the resolver as `*.resolver.spec.ts`. Build the schema once, execute mutations/queries through `ApolloServer.executeOperation`, assert on the GraphQL response (including auth errors with no token / a token for another user).
3. **Smoke test for ownership.** At minimum: a test that signs up user A, signs up user B, has A create a resource, and asserts B cannot read/update/delete it. This is the IDOR backstop required by `docs/02-escopo-por-usuario.md`.

**Choose tests by realism, not by checklist.** Add a case when a real user could plausibly hit it (sending whitespace, updating the same field twice, filtering by category they no longer own, etc.). Skip the contrived "what if the input is exactly 257 chars" cases unless the code actually branches on them. A few rich scenarios that read like a user story beat a long matrix of synthetic permutations. When the doc's listed cases feel thin, extend them — but only with cases that pull their weight.

Test data:

- Use `@faker-js/faker` for randomized realistic data (add to devDeps when first needed).
- Create users via the real `register-user` function rather than raw `prisma.user.create` — keeps password hashing honest.
- Never share state between tests; the `beforeEach` in `src/test/setup.ts` handles cleanup.

Run `pnpm test` before every commit; CI is unavoidable when the user merges.

## Error handling

- Services throw plain `Error`s with **Portuguese user-facing messages**. TypeGraphQL converts these to GraphQL `errors[]`.
- The reference repo uses `throw new Error('Usuário não autenticado!')` — we follow that pattern. Don't introduce custom error classes until a real branching need exists.
- For authorization failures (`findFirst` returns nothing with `userId` filter), throw the same "não encontrado" message you'd throw for genuinely missing rows. **Do not leak existence** of other users' resources.

## Validation

- GraphQL input shapes are enforced by TypeGraphQL's `@InputType` + `@Field` decorators (nullable, type).
- Runtime constraints beyond shape (min length, regex) — defer until a tarefa actually needs them. If/when needed, prefer Zod-parsing inside the `src/app/...` function rather than enabling `class-validator` in `buildSchema` (one validation library, not two).
- `env.ts` validates env vars with Zod at boot — that's already in place.

## Gotchas

- SQLite has no native enum — Prisma stores enums as `String`. Use TypeGraphQL's `registerEnumType` to keep GraphQL-side type safety for `TransactionType`.
- SQLite `DateTime` is stored as a TEXT/INTEGER — fine for our needs, but be aware that ordering and timezone math are less robust than Postgres.
- When adding `prisma.<model>.deleteMany()` calls to `src/test/setup.ts`, **order matters**: child tables (`Transaction`) before parent tables (`Category`, `User`).
- `pnpm seed` runs against the URL from `.env` (defaults to `file:./dev.db`). It upserts the seed user and **deletes all of that user's categorias and transações** before re-creating them — safe to re-run, but don't point it at a DB with real data.
- Any change to a `@Resolver` / `@InputType` / `@ObjectType` / enum needs `pnpm export-schema` so `./schema.graphql` is up to date for the frontend's codegen. Forgetting this won't break the backend tests but it will break frontend typechecking against the new fields.
- `updateProfile` mutation only edits `name`. E-mail and password aren't editable here. If a future tarefa adds password rotation, prefer a separate `changePassword` mutation that re-issues the JWT — don't expand `UpdateProfileInput`.
