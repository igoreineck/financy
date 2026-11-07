# Tarefa 04 — Transactions CRUD

> Origin: lines 75–78 (create/delete/edit/list transaction) in `requisitos.md`.
> Branch: `feat/04-transacoes-crud`. General workflow in [`README.md`](./README.md#workflow-per-tarefa).

## Goal

`/transactions` page with table + filters + pagination + create/edit dialog + delete confirmation. Covers all 4 transaction operations. Filters and pagination are **client-side** because the schema has no args — document this for a future migration.

## GraphQL surface (consumed)

```graphql
query ListTransactions {
  listTransactions {
    id
    description
    amount       # Int (cents)
    type         # INCOME | EXPENSE
    occurredAt
    categoryId
    category { id name color icon }
  }
}

mutation CreateTransaction($data: CreateTransactionInput!) {
  createTransaction(data: $data) {
    id description amount type occurredAt
    category { id name color icon }
  }
}

mutation UpdateTransaction($id: ID!, $data: UpdateTransactionInput!) {
  updateTransaction(id: $id, data: $data) {
    id description amount type occurredAt
    category { id name color icon }
  }
}

mutation DeleteTransaction($id: ID!) {
  deleteTransaction(id: $id)
}
```

Documents in `src/pages/transactions/queries.graphql`.

## Files to add or change

### Page and components

- `src/pages/transactions/transactions-page.tsx`
  - Header: title "Transactions", subtitle, "New transaction" button.
  - Filter bar (search by description + type + category + period).
  - Table with columns: Description · Date · Category (Tag) · Type (TypeBadge) · Amount (signed) · Actions.
  - Pagination: "1 to 10 | 27 results" in the footer.
  - Empty state when there are zero transactions or the filter returns zero.
- `src/pages/transactions/components/transaction-row.tsx` — one row (description, formatted date, category `<Tag>`, `<TypeBadge>`, `formatCurrencyCents(amount)` prefixed with `+`/`-`, edit/delete icon-buttons).
- `src/pages/transactions/components/transaction-dialog.tsx`
  - Props: `{ open, onOpenChange, mode: 'create' | 'edit', initialValues? }`.
  - Type toggle (Expense / Income) at the top — highlighted visual, controls the header color.
  - Inputs: description (text), amount (`<CurrencyInput>` returning cents), date (`type="date"` input), category (`<Select>` populated from `ListCategories` in the cache).
  - RHF + Zod: description required, amount > 0, valid occurredAt, categoryId required.
- `src/pages/transactions/components/transaction-filters.tsx`
  - Search: input with a magnifier icon, filters `description.toLowerCase().includes(query.toLowerCase())`.
  - Type: select `All | Income | Expense`.
  - Category: select populated from `ListCategories` + an "All" option.
  - Period: select `This month | Last month | All time | Custom` (custom opens 2 date inputs).
- `src/pages/transactions/components/transaction-delete-confirm.tsx` — confirm dialog.

### Helpers

- `src/lib/format.ts`
  - `formatCurrencyCents(cents: number): string` → `'R$ 12,34'`.
  - `parseCurrencyToCents(input: string): number` → `1234`.
  - `formatDate(iso: string): string` → `'30/11/25'`.
- `src/components/ui/currency-input.tsx` — input with a live `R$ 0,00` mask. Emits cents via `onChange(cents)`. Built on top of the `<Input>` from tarefa 01.
- `src/pages/transactions/hooks/use-filtered-transactions.ts` — takes `transactions` + `filters` + `page` + `pageSize`, returns `{ rows, total, totalPages }`.

### Cache strategy

- `createTransaction` / `updateTransaction` — `update(cache, { data })` inserts/updates in the `ListTransactions` query list.
- `deleteTransaction` — `cache.modify` removes the id.
- Backend error → toast with the message.

## Testing

- [x] `pages/transactions/transactions-page.spec.tsx`
  - Renders 10 rows + the `1 to 10 | 27 results` indicator.
  - Clicking "Next page" shows the rest.
  - Empty state when the filter returns nothing.
- [x] `pages/transactions/components/transaction-filters.spec.tsx`
  - Search filters by description (case-insensitive, substring).
  - Type filters only INCOME / EXPENSE.
  - Category filters; "All" turns the filter off.
  - Period "This month" shows only the current month's; "Custom" filters a custom range.
  - Filters combine (AND).
- [x] `pages/transactions/components/transaction-dialog.spec.tsx`
  - Expense/Income toggle changes the visible class.
  - Typing "12,34" into `<CurrencyInput>` emits `1234`.
  - Submit validates required fields; a valid submit calls the mutation with the right input.
  - Edit mode pre-populates everything (including the selected category).
- [x] `pages/transactions/components/transaction-delete-confirm.spec.tsx` — confirm calls the mutation; cancel closes.
- [x] `pages/transactions/hooks/use-filtered-transactions.spec.ts`
  - Total recalculates with filters applied.
  - Pagination respects filters.
  - Changing a filter resets to page 1.
- [x] `lib/format.spec.ts`
  - `formatCurrencyCents(1234) === 'R$ 12,34'`.
  - `formatCurrencyCents(0) === 'R$ 0,00'`.
  - `formatCurrencyCents(1234567) === 'R$ 12.345,67'`.
  - `parseCurrencyToCents('R$ 12,34') === 1234`.
  - `parseCurrencyToCents('12,34') === 1234`.
  - `parseCurrencyToCents('R$ 12.345,67') === 1234567`.
  - `formatDate('2025-11-30T00:00:00Z') === '30/11/25'`.
- [x] `transactions.integration.spec.tsx` (MSW)
  - List loads; create inserts a row; update updates the row; delete removes the row.

## Acceptance criteria

- [x] Table with columns: Description, Date, Category (Tag), Type (TypeBadge), Amount (formatted with sign), Actions.
- [x] "New transaction" opens a blank dialog; edit opens it pre-filled (including category).
- [x] Deleting asks for confirmation; after confirming, the row disappears.
- [x] Filters combine (AND); pagination recomputes the total with filters applied.
- [x] The amount sent to the backend is an Int in cents.
- [x] Toasts on success and error for each operation.
- [x] Lines in `requisitos.md`: create/delete/edit/list transaction checked.
- [x] `pnpm test` green; `pnpm check` clean; `pnpm tsc --noEmit` clean.
- [x] `docs/04-transacoes-crud.md` (this file) with checkboxes filled in.

## Depends on

- [`00-scaffolding.md`](./00-scaffolding.md), [`01-design-system.md`](./01-design-system.md), [`02-auth.md`](./02-auth.md).
- [`03-categorias-crud.md`](./03-categorias-crud.md) — categories are needed to pick from in the select.
- Backend `03/04/05/06` (transactions CRUD) already merged.

## Out of scope

- Server-side filters (the backend doesn't support args).
- Recurring transactions.
- Attachments / receipts.
- Multi-currency.
- Bulk delete / CSV import.
