# Tarefa 03 — Categories CRUD

> Origin: lines 79–82 (create/delete/edit/list category) in `requisitos.md`.
> Branch: `feat/03-categorias-crud`. General workflow in [`README.md`](./README.md#workflow-per-tarefa).

## Goal

Complete `/categories` page: header + 3 stat cards + card grid + create/edit dialog + delete confirmation. Covers all 4 category operations from the schema because the dialog is shared between create and edit.

## GraphQL surface (consumed)

```graphql
query ListCategories {
  listCategories {
    id
    name
    description
    icon
    color
    createdAt
  }
}

mutation CreateCategory($data: CreateCategoryInput!) {
  createCategory(data: $data) {
    id name description icon color createdAt
  }
}

mutation UpdateCategory($id: ID!, $data: UpdateCategoryInput!) {
  updateCategory(id: $id, data: $data) {
    id name description icon color
  }
}

mutation DeleteCategory($id: ID!) {
  deleteCategory(id: $id)
}
```

Documents in `src/pages/categories/queries.graphql`.

## Files to add or change

### Page and components

- `src/pages/categories/categories-page.tsx`
  - Header: title "Categories", subtitle "Organize your transactions by category", "New category" button.
  - Stat cards at the top: total categories, total transactions, most-used category. Computed client-side from `listCategories` + `listTransactions` (same cache).
  - 4-column grid of `<CategoryCard />`.
  - Empty state when there are zero categories: illustration + "Start by creating your first category" + CTA.
- `src/pages/categories/components/category-card.tsx` — icon on the left (with the `color` applied), name, description, "X items", actions (edit icon-button + danger delete icon-button).
- `src/pages/categories/components/category-dialog.tsx`
  - Props: `{ open, onOpenChange, mode: 'create' | 'edit', initialValues? }`.
  - RHF + Zod form: `name` required, `description` optional, `icon` required, `color` required.
  - `<IconPicker />` and `<ColorPicker />` controlled via `Controller`.
- `src/pages/categories/components/category-delete-confirm.tsx`
  - Small Dialog: "Delete category?" + "This action cannot be undone." + "Cancel" / "Delete" (danger) buttons.
- `src/pages/categories/components/icon-picker.tsx`
  - 6×3 grid of the style guide's 18 icons (`piggy-bank`, `briefcase-business`, `utensils`, `shopping-cart`, `car-front`, `heart-pulse`, `ticket`, `tool-case`, `wallet`, `tag`, `book-open`, `gift`, `dumbbell`, `house`, `paw-print`, `baggage-claim`, `mailbox`, `receipt-text`).
  - The selected one gets a border + bg-brand.
- `src/pages/categories/components/color-picker.tsx`
  - Row with 8 swatches (`tag-gray`, `tag-blue`, ..., `tag-green`).
  - The selected one has a black outline.

### Cache strategy

- `createCategory` / `updateCategory` — `refetchQueries: [{ query: ListCategoriesDocument }]`.
- `deleteCategory` — `update(cache, { data })`: runs `cache.modify` removing the id from the list so it disappears instantly.
  - Handle the backend error (`onDelete: Restrict` if the category has transactions) — toast with the message.

### Helper hooks

- `src/pages/categories/hooks/use-category-stats.ts` — takes `categories` + `transactions`, returns `{ totalCategories, totalTransactions, mostUsed }`.

### Icon string → component mapping

- `src/pages/categories/icon-map.ts` — `Record<string, LucideIcon>` (`{ 'piggy-bank': PiggyBank, ... }`). For dynamic rendering in the cards.

## Testing

- [x] `pages/categories/categories-page.spec.tsx`
  - Renders the grid with a mock of 3 categories.
  - Empty state appears when `listCategories` returns `[]`.
  - Clicking "New category" opens the dialog in `create` mode.
  - Stat cards show the correct counts.
- [x] `pages/categories/components/category-dialog.spec.tsx`
  - `create` mode: submit without a name blocks; without an icon blocks; without a color blocks.
  - `edit` mode: fields pre-populated with `initialValues`.
  - Valid submit calls the mutation with the correct input.
  - Cancel closes without calling the mutation.
- [x] `pages/categories/components/icon-picker.spec.tsx` — click marks it selected (aria-pressed); only one selected at a time.
- [x] `pages/categories/components/color-picker.spec.tsx` — mirror.
- [x] `pages/categories/components/category-delete-confirm.spec.tsx`
  - Confirm calls the mutation; cancel closes without calling it.
  - Backend returns an FK error (`onDelete: Restrict`) → toast with the message.
- [x] `pages/categories/hooks/use-category-stats.spec.ts`
  - Empty inputs → all zeros.
  - Categories with transactions → correct count; `mostUsed` is the one with the most transactions.
- [x] `categories.integration.spec.tsx` (MSW)
  - Loads `ListCategories` → grid renders.
  - Creates a category → grid includes the new card.
  - Edits a category → card updates in place.
  - Deletes a category → card disappears (cache update).

## Acceptance criteria

- [x] Listing renders cards with icon (with the tag color applied), name, description, "X items" (transactions).
- [x] "New category" opens a blank dialog; "Edit" opens a pre-filled dialog.
- [x] Deleting asks for confirmation; after confirming, the card disappears without a visible refetch.
- [x] Backend rejects deleting a category with transactions → toast with the backend message, the card stays.
- [x] 3 stat cards at the top (total categories, total transactions, most used) reflect the dataset.
- [x] Empty state when there are zero categories.
- [x] Lines in `requisitos.md`: create/delete/edit/list category checked.
- [x] `pnpm test` green; `pnpm check` clean; `pnpm tsc --noEmit` clean.
- [x] `docs/03-categorias-crud.md` (this file) with checkboxes filled in.

## Depends on

- [`00-scaffolding.md`](./00-scaffolding.md), [`01-design-system.md`](./01-design-system.md), [`02-auth.md`](./02-auth.md).
- Backend `07/08/09/10` (categories CRUD) already merged (`f36d32a`).

## Out of scope

- Reordering categories (drag-and-drop).
- Custom colors/icons beyond the style guide's 8 + 18.
- Hierarchy / subcategories.
- Bulk delete.
