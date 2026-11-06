# Tarefa 05 — Dashboard

> Branch: `feat/05-dashboard`. General workflow in [`README.md`](./README.md#workflow-per-tarefa).

## Goal

`/` page (logged in) with 3 stat cards for the current month + a list of recent transactions + a summary of the most-used categories. **There's no aggregating query in the backend**; the dashboard reduces client-side from the same `ListTransactions` + `ListCategories` queries that `03` and `04` already use. The Apollo cache is shared.

## GraphQL surface (reused)

```graphql
# Reuses ListTransactions + ListCategories from tarefa 03/04
# No mutations in this tarefa
```

## Files to add or change

### Page and components

- `src/pages/dashboard/dashboard-page.tsx`
  - Simple header (the global Navbar already shows context).
  - 3 `<StatCard>`s: "Total balance" · "Monthly income" · "Monthly expenses".
  - `<RecentTransactions>`: top 5 ordered by `occurredAt desc`.
  - `<CategorySummary>`: top 5 categories of the month by aggregated amount.
  - Empty state when there are zero transactions: "Start by creating your first transaction" + CTA to `/transactions`.
- `src/pages/dashboard/components/stat-card.tsx`
  - Variants `positive` (green) · `negative` (red) · `neutral` (gray).
  - Shows the label, the value (formatted via `formatCurrencyCents`), and the matching icon.
- `src/pages/dashboard/components/recent-transactions.tsx`
  - Compact list of up to 5 transactions: description, date, signed amount, category tag.
- `src/pages/dashboard/components/category-summary.tsx`
  - Rows with: category name + color tag + "X items" + monetary total.
  - Ordered by total desc.

### Hooks

- `src/pages/dashboard/hooks/use-monthly-summary.ts`
  - Input: `transactions` (full list for the current month OR last month, depending on a future filter).
  - Output: `{ saldo, receitas, despesas }` (balance, income, expenses) in cents.
  - **Rule**: uses transactions whose `occurredAt` falls in the current month (user's timezone).
  - `saldo = receitas - despesas`.
- `src/pages/dashboard/hooks/use-category-aggregates.ts`
  - Input: `transactions` + `categories`.
  - Output: `Array<{ category, count, total }>` ordered by `total` desc.

## Testing

- [x] `pages/dashboard/hooks/use-monthly-summary.spec.ts`
  - Empty list → `{ saldo: 0, receitas: 0, despesas: 0 }`.
  - Mix of INCOME/EXPENSE in the current month → correct sum; saldo = receitas - despesas.
  - Last month's transactions → ignored.
  - Integers (cents) keep exact precision.
- [x] `pages/dashboard/hooks/use-category-aggregates.spec.ts`
  - Groups by `categoryId`, computes `count` and `total`.
  - Orders by `total` desc.
  - Category with no transactions in the month → omitted from the result.
- [x] `pages/dashboard/components/stat-card.spec.tsx` — variants apply the correct classes; value formatted.
- [x] `pages/dashboard/components/recent-transactions.spec.tsx` — limits to 5; desc order; empty state.
- [x] `pages/dashboard/components/category-summary.spec.tsx` — renders the top 5.
- [x] `dashboard.integration.spec.tsx` (MSW)
  - Mock returns transactions across various months → stats only consider the current month.
  - Renders 3 stat cards + recent + top categories.

## Acceptance criteria

- [x] 3 stat cards with the current month's values.
- [x] 5 most recent transactions (ordered by `occurredAt`).
- [x] Summary of up to 5 categories with count + total.
- [x] Empty state when there are zero transactions.
- [x] Values in BRL (`R$ 1.234,56`) and dates as `dd/mm/yy` (`30/11/25`).
- [x] `pnpm test` green; `pnpm check` clean; `pnpm tsc --noEmit` clean.
- [x] `docs/05-dashboard.md` (this file) with checkboxes filled in.

## Depends on

- [`00-scaffolding.md`](./00-scaffolding.md), [`01-design-system.md`](./01-design-system.md), [`02-auth.md`](./02-auth.md).
- [`03-categorias-crud.md`](./03-categorias-crud.md) and [`04-transacoes-crud.md`](./04-transacoes-crud.md) — shared queries and cache.

## Out of scope

- Charts (line, pie, bar) — the design doesn't have them.
- Period filter on the dashboard (only "this month").
- Comparison with the previous month.
- Goals / budgets.
