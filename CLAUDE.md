# CLAUDE.md

This file gives Claude Code (claude.ai/code) workspace-level guidance for the
`financy` monorepo. For per-package detail, jump into each subdirectory's own
`CLAUDE.md`.

## Layout

```
financy/
├── backend/    # GraphQL API (Apollo + TypeGraphQL + Prisma + SQLite)
├── frontend/   # SPA (React 19 + Vite + Apollo Client + Tailwind v4)
└── README.md
```

The backend and frontend are independent pnpm projects — there is **no** root
`package.json` or workspace config. Run commands from inside each package.

- Backend guide: [`backend/CLAUDE.md`](./backend/CLAUDE.md)
- Frontend guide: [`frontend/CLAUDE.md`](./frontend/CLAUDE.md)
- Backend user-facing docs: [`backend/README.md`](./backend/README.md)
- Frontend user-facing docs: [`frontend/README.md`](./frontend/README.md)
- Per-tarefa specs: `backend/docs/NN-*.md` and `frontend/docs/NN-*.md`

## What this project is

A personal-finance app built for the Rocketseat Pós-Tech assignment. The
backend exposes a typed GraphQL API and owns the auth model and user-scoped
data. The frontend is a single-page React app that consumes that API.

All 10 backend tarefas and 6 frontend tarefas are merged on `main`. The current
work is polish, bug fixes, and incremental design tweaks — not new modules.

## Cross-project conventions

Both packages share these rules. When the two `CLAUDE.md` files disagree on a
detail, the more specific one wins.

- **Package manager**: `pnpm`. Never use `npm` or `yarn`. Lockfiles
  (`pnpm-lock.yaml`) are committed.
- **TypeScript**: `strict` on, ESM (`"type": "module"`), `moduleResolution:
  bundler`, `@/*` path alias mapping to `src/*`. No `.js` extensions on
  relative imports.
- **Lint/format**: Biome is the single source of truth in both packages.
  Single quotes, no semicolons (asNeeded), 2-space indent, 80-char line. Always
  run `pnpm check` before committing.
- **Tests**: Vitest. Spec files are colocated next to source as `*.spec.ts`
  (backend) or `*.spec.tsx` (frontend). Run `pnpm test` from each package
  before committing.
- **Languages**: User-facing strings — labels, button text, error messages,
  toasts — are **Portuguese**. Everything else is **English**: code, comments,
  variable names, test names, commit messages, PR titles, PR bodies. Even when
  a `throw new Error('Categoria não encontrada')` carries a Portuguese
  message, the surrounding code stays English.
- **Filenames**: kebab-case (`update-profile.ts`, `category-card.tsx`).
  Functional/function-based exports; no default exports.
- **Commits**: short English subject. No `feat:` prefix. No tarefa number.
  Never add Claude attribution to commits or PR bodies.
- **GitHub**: drive everything via `gh` CLI — PRs, comments, checks. Don't
  paste URLs into a browser when `gh` covers it. PR titles/bodies are
  English even though user-facing strings in the diff are Portuguese.

## Cross-project workflow

Each tarefa is its own branch, draft PR, review, and merge cycle. The user
reviews and merges; never push directly to `main` from either package.

```bash
# from the right subdir (backend/ or frontend/)
git checkout main && git pull --ff-only
git checkout -b feat/NN-slug

# implement → check off the matching docs/NN-*.md and requisitos.md
pnpm check                    # both packages
pnpm tsc --noEmit             # frontend; backend uses `npx tsc --noEmit`
pnpm test                     # both packages

git add .
git commit -m "<short English summary>"
git push -u origin feat/NN-slug
gh pr create --draft --title "..." --body "..."
```

The per-package `CLAUDE.md` has the exact draft PR body template each side
uses.

## End-to-end loop while developing

1. Start the backend: `cd backend && pnpm dev` → `http://localhost:4000/graphql`
2. Optionally seed sample data: `cd backend && pnpm seed`
   (creates `conta@teste.com` / `senha123` with 10 categorias + ~70 transações)
3. Regenerate the frontend's typed GraphQL once after any schema change:
   `cd frontend && pnpm codegen` (or run `pnpm codegen:watch`).
4. Start the frontend: `cd frontend && pnpm dev` → `http://localhost:5173`.

The frontend's `src/gql/` is gitignored — a fresh clone won't typecheck
until `pnpm codegen` runs.

## Where decisions live

- Money is integer cents in the backend (`amount: Int!`). The frontend formats
  for display via `Intl.NumberFormat('pt-BR', { style: 'currency', currency:
  'BRL' })`.
- Auth lives in the backend: bcrypt + 1-day HS256 JWT. The frontend stores
  the token in a persisted Zustand store and clears it on logout.
- The backend exposes `me` and `updateProfile`; e-mail and password are not
  editable (only `name`).
- Per-user data scoping is enforced in every resolver — never trust the
  client to send the right `userId`. See `backend/docs/02-escopo-por-usuario.md`.

## When in doubt

Read the per-package `CLAUDE.md` first. If a detail isn't covered there,
check the relevant `docs/NN-*.md` for tarefa-level intent. If still unclear,
ask the user before guessing — the project has consistent conventions and
inventing new ones will cost a follow-up cleanup PR.
