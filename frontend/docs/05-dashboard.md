# Tarefa 05 — Dashboard

> Branch: `feat/05-dashboard`. Workflow geral em [`README.md`](./README.md#workflow-per-tarefa).

## Objetivo

Página `/` (logada) com 3 stat cards do mês corrente + lista de transações recentes + sumário das categorias mais usadas. **Não há query agregadora no backend**; o dashboard reduz client-side a partir das mesmas queries `ListTransactions` + `ListCategories` que a `03` e `04` já usam. Apollo cache é compartilhado.

## GraphQL surface (reusa)

```graphql
# Reaproveita ListTransactions + ListCategories da tarefa 03/04
# Sem mutations nesta tarefa
```

## Files to add or change

### Página e componentes

- `src/pages/dashboard/dashboard-page.tsx`
  - Header simples (Navbar global já mostra contexto).
  - 3 `<StatCard>`: "Saldo total" · "Receitas do mês" · "Despesas do mês".
  - `<RecentTransactions>`: top 5 ordenadas por `occurredAt desc`.
  - `<CategorySummary>`: top 5 categorias do mês por valor agregado.
  - Empty state se zero transações: "Comece criando sua primeira transação" + CTA pra `/transacoes`.
- `src/pages/dashboard/components/stat-card.tsx`
  - Variants `positive` (verde) · `negative` (vermelho) · `neutral` (gray).
  - Exibe label, valor (formatado via `formatCurrencyCents`), ícone correspondente.
- `src/pages/dashboard/components/recent-transactions.tsx`
  - Lista compacta de até 5 transações: descrição, data, valor com sinal, tag de categoria.
- `src/pages/dashboard/components/category-summary.tsx`
  - Linhas com: nome da categoria + tag de cor + "X itens" + total monetário.
  - Ordenado por total desc.

### Hooks

- `src/pages/dashboard/hooks/use-monthly-summary.ts`
  - Input: `transactions` (lista completa do mês corrente OU mês passado dependendo de filtro futuro).
  - Output: `{ saldo, receitas, despesas }` em centavos.
  - **Regra**: usa transações cujo `occurredAt` está no mês corrente (timezone do usuário).
  - `saldo = receitas - despesas`.
- `src/pages/dashboard/hooks/use-category-aggregates.ts`
  - Input: `transactions` + `categories`.
  - Output: `Array<{ category, count, total }>` ordenado por `total` desc.

## Testing

- [x] `pages/dashboard/hooks/use-monthly-summary.spec.ts`
  - Lista vazia → `{ saldo: 0, receitas: 0, despesas: 0 }`.
  - Mix INCOME/EXPENSE no mês corrente → soma correta; saldo = receitas - despesas.
  - Transações de mês passado → ignoradas.
  - Inteiros (centavos) preservam precisão exata.
- [x] `pages/dashboard/hooks/use-category-aggregates.spec.ts`
  - Agrupa por `categoryId`, calcula `count` e `total`.
  - Ordena por `total` desc.
  - Categoria sem transações no mês → omitida do retorno.
- [x] `pages/dashboard/components/stat-card.spec.tsx` — variants aplicam classes corretas; valor formatado.
- [x] `pages/dashboard/components/recent-transactions.spec.tsx` — limita a 5; ordem desc; empty state.
- [x] `pages/dashboard/components/category-summary.spec.tsx` — render top 5.
- [x] `dashboard.integration.spec.tsx` (MSW)
  - Mock devolve transações em meses variados → stats só consideram o mês corrente.
  - Renderiza 3 stat cards + recentes + top categorias.

## Acceptance criteria

- [x] 3 stat cards com valores do mês corrente.
- [x] 5 transações mais recentes (ordenadas por `occurredAt`).
- [x] Sumário de até 5 categorias com contagem + total.
- [x] Empty state quando zero transações.
- [x] Valores em pt-BR (`R$ 1.234,56`) e datas (`30/11/25`).
- [x] `pnpm test` verde; `pnpm check` limpo; `pnpm tsc --noEmit` limpo.
- [x] `docs/05-dashboard.md` (este arquivo) com checkboxes preenchidos.

## Depends on

- [`00-scaffolding.md`](./00-scaffolding.md), [`01-design-system.md`](./01-design-system.md), [`02-auth.md`](./02-auth.md).
- [`03-categorias-crud.md`](./03-categorias-crud.md) e [`04-transacoes-crud.md`](./04-transacoes-crud.md) — queries e cache compartilhados.

## Out of scope

- Gráficos (linha, pizza, barras) — design não tem.
- Filtro de período no dashboard (só "este mês").
- Comparação com mês anterior.
- Metas / orçamentos.
