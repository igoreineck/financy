# Frontend — Plano de execução

> Espelho do `backend/docs/` adaptado ao frontend. Cada tarefa abaixo é um branch isolado, um draft PR, review, merge — sequencial. O usuário revisa e faz o merge; nunca push direto em `main`.

## Origem

Requisitos funcionais em [`../requisitos.md`](../requisitos.md) (10 checkboxes). Decisões de stack, arquitetura, mapeamento Figma → código e o roadmap detalhado estão no plano salvo em `/Users/igoreineck/.claude/plans/vamos-estruturar-o-projeto-cached-cerf.md`.

## Referências

- **Stack** — [`rocketseat-education/ftr-pos-360-mindshare/frontend`](https://github.com/rocketseat-education/ftr-pos-360-mindshare/tree/main/frontend) (Apollo + Vite + shadcn + Zustand)
- **Estilo de código** — [`igoreineck/brev.ly/web`](https://github.com/igoreineck/brev.ly/tree/main/web) (kebab-case, RHF + Zod, Tailwind v4 `@theme`, env Zod, `@/*` alias, Biome). **Quando conflitarem, brev.ly vence.**
- **Figma** — `Ix1zaJNlMOhIRHUxaqhmo8`. Style Guide: `node-id=3-377`. Protótipos: `node-id=3-376`.
- **Schema GraphQL** — `../../backend/schema.graphql` (consumido pelo `graphql-codegen`).

## Stack

- Vite 7, React 19, TypeScript estrito, ESM.
- Tailwind CSS v4 (`@theme` em `src/index.css`), `clsx` + `tailwind-merge` via `cn()`.
- shadcn primitives em `src/components/ui/`. Ícones via `lucide-react`.
- React Hook Form + Zod (schema separado, parse no submit — sem resolver Zod).
- React Router 7 (`createBrowserRouter`) + `<ProtectedRoute>` / `<PublicRoute>`.
- Apollo Client 4 + `graphql-codegen` + `typed-document-node` → `src/gql/`.
- Zustand + `persist` (chave `'financy-auth'`).
- Sonner para toasts.
- Vitest + `@testing-library/react` + `@testing-library/user-event` + MSW.
- Biome (mesma config do backend: aspas simples, sem semi, `@/*` alias, kebab-case).

## Tarefas

| Ordem | Doc                                               | Resumo                                              | Requisitos cobertos        |
| ----- | ------------------------------------------------- | --------------------------------------------------- | -------------------------- |
| 00    | [`00-scaffolding.md`](./00-scaffolding.md)         | Vite + deps + Apollo + tooling vazios rodando       | (fundação — sem checkbox)  |
| 01    | [`01-design-system.md`](./01-design-system.md)     | Tokens do Figma + primitivos em `components/ui/`    | (fundação — sem checkbox)  |
| 02    | [`02-auth.md`](./02-auth.md)                       | Login + Cadastro + auth store + route guards        | criar conta e login        |
| 03    | [`03-categorias-crud.md`](./03-categorias-crud.md) | Categorias: list + create + update + delete         | 4 checkboxes de categoria  |
| 04    | [`04-transacoes-crud.md`](./04-transacoes-crud.md) | Transações: tabela + filtros + paginação + CRUD     | 4 checkboxes de transação  |
| 05    | [`05-dashboard.md`](./05-dashboard.md)             | Dashboard: stats + recentes + sumário de categorias | (deriva das listas — implícito) |
| 06    | [`06-perfil-logout.md`](./06-perfil-logout.md)     | Perfil + user-menu + logout                         | (encerra o fluxo)          |

Ordem rígida: `00 → 01 → 02 → 03 → 04 → 05 → 06`. Cada tarefa assume tudo anterior pronto.

## Workflow per tarefa

```bash
git checkout main && git pull --ff-only
git checkout -b feat/NN-slug                # e.g. feat/00-scaffolding

# implementa seguindo docs/NN-*.md
pnpm check                                  # Biome lint + format autofix
pnpm tsc --noEmit                           # type check
pnpm test                                   # vitest

# checkboxes de Testing + Acceptance criteria preenchidos no MD da tarefa
# linhas de requisitos.md (Tarefas) que casem com o escopo marcadas

git add .
git commit -m "<short summary>"             # sem prefix "feat:", sem número da tarefa (estilo do owner)
git push -u origin feat/NN-slug

gh pr create --draft \
  --title "<curto>" \
  --body "$(cat <<'EOF'
Closes the scope in `docs/NN-<slug>.md`.

## Summary
- <bullet>

## Test plan
- [ ] manual: <como exercitar a feature no browser>
- [ ] automated: `pnpm test` (ver novos `*.spec.tsx`)
EOF
)"
```

O usuário revê o draft, marca como ready e faz merge. A próxima tarefa parte de um `main` atualizado.

## Verificação end-to-end (após tudo)

1. Subir backend (`cd ../backend && pnpm dev`) em `:4000`.
2. Subir frontend (`pnpm dev`) em `:5173`.
3. Smoke:
   - Cadastrar usuário → dashboard vazio
   - Criar 3 categorias com ícones e cores distintas
   - Criar 5 transações em meses diferentes, mix INCOME/EXPENSE
   - Dashboard: stats batem com a aritmética manual
   - Filtrar transações por categoria, paginar
   - Editar e deletar uma transação
   - Tentar deletar categoria com transações → backend rejeita (`onDelete: Restrict`) → toast com a mensagem
   - Logout, re-login, dados persistem
4. `pnpm test` verde, `pnpm check` limpo, `pnpm tsc --noEmit` limpo.
5. Todas as 10 linhas em `requisitos.md` marcadas.

## Out of scope (do projeto inteiro)

- Refresh token rotation (backend não suporta).
- Recuperação de senha.
- Tema dark.
- i18n (todo texto em pt-BR).
- PWA / offline.
- Storybook.
- E2E (Playwright) — pode entrar depois como tarefa 07 se necessário.
