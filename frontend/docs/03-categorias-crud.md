# Tarefa 03 — Categorias CRUD

> Origem: linhas 79–82 (criar/deletar/editar/listar categoria) em `requisitos.md`.
> Branch: `feat/03-categorias-crud`. Workflow geral em [`README.md`](./README.md#workflow-per-tarefa).

## Objetivo

Página `/categorias` completa: header + 3 stat cards + grid de cards + dialog de create/edit + confirm de delete. Cobre as 4 operações de categoria do schema porque o dialog é compartilhado entre create e edit.

## GraphQL surface (consumido)

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

Documentos em `src/pages/categories/queries.graphql`.

## Files to add or change

### Página e componentes

- `src/pages/categories/categories-page.tsx`
  - Header: título "Categorias", subtítulo "Organize suas transações por categorias", botão "Nova categoria".
  - Stats cards no topo: total de categorias, total de transações, categoria mais usada. Computados client-side a partir de `listCategories` + `listTransactions` (mesma cache).
  - Grid 4 colunas de `<CategoryCard />`.
  - Empty state se zero categorias: ilustração + "Comece criando sua primeira categoria" + CTA.
- `src/pages/categories/components/category-card.tsx` — ícone à esquerda (cor do `color` aplicada), nome, descrição, "X itens", ações (icon-button editar + icon-button delete-danger).
- `src/pages/categories/components/category-dialog.tsx`
  - Props: `{ open, onOpenChange, mode: 'create' | 'edit', initialValues? }`.
  - Form RHF + Zod: `name` required, `description` optional, `icon` required, `color` required.
  - `<IconPicker />` e `<ColorPicker />` controlados via `Controller`.
- `src/pages/categories/components/category-delete-confirm.tsx`
  - Pequeno Dialog: "Excluir categoria?" + "Esta ação não pode ser desfeita." + botões "Cancelar" / "Excluir" (danger).
- `src/pages/categories/components/icon-picker.tsx`
  - Grid 6×3 dos 18 ícones do style guide (`piggy-bank`, `briefcase-business`, `utensils`, `shopping-cart`, `car-front`, `heart-pulse`, `ticket`, `tool-case`, `wallet`, `tag`, `book-open`, `gift`, `dumbbell`, `house`, `paw-print`, `baggage-claim`, `mailbox`, `receipt-text`).
  - Selecionado fica com borda + bg-brand.
- `src/pages/categories/components/color-picker.tsx`
  - Linha com 8 swatches (`tag-gray`, `tag-blue`, ..., `tag-green`).
  - Selecionado tem outline preto.

### Cache strategy

- `createCategory` / `updateCategory` — `refetchQueries: [{ query: ListCategoriesDocument }]`.
- `deleteCategory` — `update(cache, { data })`: faz `cache.modify` removendo o id da lista pra sumir instantâneo.
  - Tratar erro do backend (`onDelete: Restrict` se categoria tem transações) — toast com mensagem.

### Hooks auxiliares

- `src/pages/categories/hooks/use-category-stats.ts` — recebe `categories` + `transactions`, retorna `{ totalCategories, totalTransactions, mostUsed }`.

### Mapeamento de ícone string → componente

- `src/pages/categories/icon-map.ts` — `Record<string, LucideIcon>` (`{ 'piggy-bank': PiggyBank, ... }`). Pra render dinâmico dos cards.

## Testing

- [x] `pages/categories/categories-page.spec.tsx`
  - Renderiza grid com mock de 3 categorias.
  - Empty state aparece quando `listCategories` retorna `[]`.
  - Click em "Nova categoria" abre o dialog em modo `create`.
  - Stats cards mostram contagens corretas.
- [x] `pages/categories/components/category-dialog.spec.tsx`
  - Modo `create`: submit sem nome bloqueia; sem ícone bloqueia; sem cor bloqueia.
  - Modo `edit`: campos pre-populados com `initialValues`.
  - Submit válido chama mutation com input correto.
  - Cancel fecha sem chamar mutation.
- [x] `pages/categories/components/icon-picker.spec.tsx` — click marca selecionado (aria-pressed); apenas um selecionado por vez.
- [x] `pages/categories/components/color-picker.spec.tsx` — espelho.
- [x] `pages/categories/components/category-delete-confirm.spec.tsx`
  - Confirmar chama mutation; cancelar fecha sem chamar.
  - Backend retorna erro de FK (`onDelete: Restrict`) → toast com mensagem.
- [x] `pages/categories/hooks/use-category-stats.spec.ts`
  - Inputs vazios → tudo zero.
  - Categorias com transações → contagem certa; `mostUsed` é a com mais transactions.
- [x] `categories.integration.spec.tsx` (MSW)
  - Carrega `ListCategories` → grid renderiza.
  - Cria categoria → grid inclui o novo card.
  - Edita categoria → card atualiza in-place.
  - Deleta categoria → card desaparece (cache update).

## Acceptance criteria

- [x] Listagem renderiza cards com ícone (com cor do tag aplicada), nome, descrição, "X itens" (de transações).
- [x] "Nova categoria" abre dialog limpo; "Editar" abre dialog pré-preenchido.
- [x] Deletar pede confirmação; após confirmar, card desaparece sem refetch visível.
- [x] Backend rejeita delete de categoria com transações → toast com mensagem do backend, card permanece.
- [x] 3 stat cards no topo (total categorias, total transações, mais usada) refletem o dataset.
- [x] Empty state quando zero categorias.
- [x] Linhas em `requisitos.md`: criar/deletar/editar/listar categoria marcadas.
- [x] `pnpm test` verde; `pnpm check` limpo; `pnpm tsc --noEmit` limpo.
- [x] `docs/03-categorias-crud.md` (este arquivo) com checkboxes preenchidos.

## Depends on

- [`00-scaffolding.md`](./00-scaffolding.md), [`01-design-system.md`](./01-design-system.md), [`02-auth.md`](./02-auth.md).
- Backend `07/08/09/10` (categorias CRUD) já mergeados (`f36d32a`).

## Out of scope

- Reordenar categorias (drag-and-drop).
- Cores/ícones customizados além dos 8 + 18 do style guide.
- Hierarquia / subcategorias.
- Bulk delete.
