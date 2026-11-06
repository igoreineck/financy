# Frontend — Execution plan

> Mirror of `backend/docs/` adapted to the frontend. Each tarefa below is an isolated branch, a draft PR, review, merge — sequentially. The user reviews and merges; never push directly to `main`.

## Origin

Functional requirements in [`../requisitos.md`](../requisitos.md) (10 checkboxes). Stack decisions, architecture, the Figma → code mapping, and the detailed roadmap live in the plan saved at `/Users/igoreineck/.claude/plans/vamos-estruturar-o-projeto-cached-cerf.md`.

## References

- **Stack** — [`rocketseat-education/ftr-pos-360-mindshare/frontend`](https://github.com/rocketseat-education/ftr-pos-360-mindshare/tree/main/frontend) (Apollo + Vite + shadcn + Zustand)
- **Code style** — [`igoreineck/brev.ly/web`](https://github.com/igoreineck/brev.ly/tree/main/web) (kebab-case, RHF + Zod, Tailwind v4 `@theme`, Zod env, `@/*` alias, Biome). **When they conflict, brev.ly wins.**
- **Figma** — `Ix1zaJNlMOhIRHUxaqhmo8`. Style Guide: `node-id=3-377`. Prototypes: `node-id=3-376`.
- **GraphQL schema** — `../../backend/schema.graphql` (consumed by `graphql-codegen`).

## Stack

- Vite 7, React 19, strict TypeScript, ESM.
- Tailwind CSS v4 (`@theme` in `src/index.css`), `clsx` + `tailwind-merge` via `cn()`.
- shadcn primitives in `src/components/ui/`. Icons via `lucide-react`.
- React Hook Form + Zod (separate schema, parse on submit — no Zod resolver).
- React Router 7 (`createBrowserRouter`) + `<ProtectedRoute>` / `<PublicRoute>`.
- Apollo Client 4 + `graphql-codegen` + `typed-document-node` → `src/gql/`.
- Zustand + `persist` (key `'financy-auth'`).
- Sonner for toasts.
- Vitest + `@testing-library/react` + `@testing-library/user-event` + MSW.
- Biome (same config as the backend: single quotes, no semis, `@/*` alias, kebab-case).

## Tarefas

| Order | Doc                                                | Summary                                             | Requirements covered       |
| ----- | -------------------------------------------------- | --------------------------------------------------- | -------------------------- |
| 00    | [`00-scaffolding.md`](./00-scaffolding.md)         | Empty Vite + deps + Apollo + tooling running        | (foundation — no checkbox) |
| 01    | [`01-design-system.md`](./01-design-system.md)     | Figma tokens + primitives in `components/ui/`       | (foundation — no checkbox) |
| 02    | [`02-auth.md`](./02-auth.md)                       | Login + sign-up + auth store + route guards         | create account and log in  |
| 03    | [`03-categorias-crud.md`](./03-categorias-crud.md) | Categories: list + create + update + delete         | 4 category checkboxes      |
| 04    | [`04-transacoes-crud.md`](./04-transacoes-crud.md) | Transactions: table + filters + pagination + CRUD   | 4 transaction checkboxes   |
| 05    | [`05-dashboard.md`](./05-dashboard.md)             | Dashboard: stats + recent + category summary        | (derived from the lists — implicit) |
| 06    | [`06-perfil-logout.md`](./06-perfil-logout.md)     | Profile + user menu + logout                        | (closes the flow)          |

Strict order: `00 → 01 → 02 → 03 → 04 → 05 → 06`. Each tarefa assumes everything before it is done.

## Workflow per tarefa

```bash
git checkout main && git pull --ff-only
git checkout -b feat/NN-slug                # e.g. feat/00-scaffolding

# implement following docs/NN-*.md
pnpm check                                  # Biome lint + format autofix
pnpm tsc --noEmit                           # type check
pnpm test                                   # vitest

# Testing + Acceptance criteria checkboxes filled in the tarefa's MD
# matching lines in requisitos.md (Tarefas) checked off

git add .
git commit -m "<short summary>"             # no "feat:" prefix, no tarefa number (owner's style)
git push -u origin feat/NN-slug

gh pr create --draft \
  --title "<short>" \
  --body "$(cat <<'EOF'
Closes the scope in `docs/NN-<slug>.md`.

## Summary
- <bullet>

## Test plan
- [ ] manual: <how to exercise the feature in the browser>
- [ ] automated: `pnpm test` (see new `*.spec.tsx`)
EOF
)"
```

The user reviews the draft, marks it ready, and merges. The next tarefa starts from an up-to-date `main`.

## End-to-end verification (after everything)

1. Start the backend (`cd ../backend && pnpm dev`) on `:4000`.
2. Start the frontend (`pnpm dev`) on `:5173`.
3. Smoke:
   - Sign up a user → empty dashboard
   - Create 3 categories with distinct icons and colors
   - Create 5 transactions across different months, mixing INCOME/EXPENSE
   - Dashboard: stats match the manual arithmetic
   - Filter transactions by category, paginate
   - Edit and delete a transaction
   - Try to delete a category with transactions → backend rejects (`onDelete: Restrict`) → toast with the message
   - Log out, log back in, data persists
4. `pnpm test` green, `pnpm check` clean, `pnpm tsc --noEmit` clean.
5. All 10 lines in `requisitos.md` checked.

## Out of scope (whole project)

- Refresh token rotation (the backend doesn't support it).
- Password recovery.
- Dark theme.
- i18n (all text is in English).
- PWA / offline.
- Storybook.
- E2E (Playwright) — may land later as tarefa 07 if needed.
