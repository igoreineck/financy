# Tarefa 10 — It must be possible to list all categories

> Origin: line 67 of the "Tarefas" section in `requisitos.md`.
> Branch: `feat/10-listar-categorias`.

## Goal

List all of the user's own categories.

## GraphQL surface

```graphql
type Query {
  listCategories: [CategoryModel!]!
}
```

## Files to add or change

- `src/app/categories/list-categories.ts` — `export async function listCategories(userId)`:
  ```ts
  return prisma.category.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  })
  ```
- `src/graphql/resolvers/category.resolver.ts` — add `@Query(() => [CategoryModel]) listCategories(@GqlUser() user)`.

## Authorization

See [02 — Per-user scoping](./02-escopo-por-usuario.md). The `findMany` **must** have `where: { userId }`.

## Testing

- `src/app/categories/list-categories.spec.ts`
  - [x] returns only the authenticated user's categories (create categories for A and B, list as A, B's don't show up).
  - [x] `name` ascending order.
  - [x] a user with no categories gets `[]`.
- `src/graphql/resolvers/category.resolver.spec.ts`
  - [x] query returns the list.
  - [x] no token → authentication error.

## Acceptance criteria

- [x] `listCategories` returns only the authenticated user's categories.
- [x] Order: `name` asc.
- [x] Empty → `[]`.
- [x] No JWT → `User not authenticated!`.
- [x] Suite green.

## Depends on

- [07 — Create category](./07-criar-categoria.md).
- [01 — Create account and log in](./01-criar-conta-e-login.md).
- [02 — Per-user scoping](./02-escopo-por-usuario.md).

## Out of scope

- Pagination.
- Filters / search.
- Transaction count per category (optional FieldResolver, outside this scope).
