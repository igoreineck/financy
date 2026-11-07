# Tarefa 09 — It must be possible to edit a category

> Origin: line 66 of the "Tarefas" section in `requisitos.md`.
> Branch: `feat/09-editar-categoria`.

## Goal

Update fields of an existing category owned by the user.

## GraphQL surface

```graphql
input UpdateCategoryInput {
  name: String
  color: String
  icon: String
  description: String
}

type Mutation {
  updateCategory(id: ID!, data: UpdateCategoryInput!): CategoryModel!
}
```

All optional.

## Files to add or change

- `src/graphql/inputs/category.input.ts` — add `UpdateCategoryInput`.
- `src/app/categories/update-category.ts` — `export async function updateCategory(id, data, userId)`:
  ```ts
  const existing = await prisma.category.findFirst({ where: { id, userId } })
  if (!existing) throw new Error('Category not found')
  return prisma.category.update({ where: { id }, data })
  ```
- `src/graphql/resolvers/category.resolver.ts` — add the `updateCategory(@Arg('id'), @Arg('data'), @GqlUser() user)` mutation.

## Authorization

See [02 — Per-user scoping](./02-escopo-por-usuario.md).

## Testing

- `src/app/categories/update-category.spec.ts`
  - [x] partial update preserves fields not sent.
  - [x] someone else's id → `Category not found`.
  - [x] `updatedAt` is updated.
- `src/graphql/resolvers/category.resolver.spec.ts`
  - [x] mutation returns the updated object.
  - [x] user A can't edit B's category.

## Acceptance criteria

- [x] Partial update only changes the fields sent.
- [x] Cross-user update → `Category not found`.
- [x] `updatedAt` updated automatically.
- [x] No JWT → `User not authenticated!`.
- [x] Suite green.

## Depends on

- [07 — Create category](./07-criar-categoria.md).
- [01 — Create account and log in](./01-criar-conta-e-login.md).
- [02 — Per-user scoping](./02-escopo-por-usuario.md).

## Out of scope

- Version history.
- Decision on `description: null` (clear vs. not sent): follow TypeGraphQL's rule — a field not sent = `undefined`, and Prisma ignores `undefined`. An explicit `null` clears it.
