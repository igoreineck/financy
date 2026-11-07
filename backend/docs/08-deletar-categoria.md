# Tarefa 08 — It must be possible to delete a category

> Origin: line 65 of the "Tarefas" section in `requisitos.md`.
> Branch: `feat/08-deletar-categoria`.

## Goal

Delete one of the user's own categories **as long as no transactions are linked to it**.

## GraphQL surface

```graphql
type Mutation {
  deleteCategory(id: ID!): Boolean!
}
```

## Files to add or change

- `src/app/categories/delete-category.ts` — `export async function deleteCategory(id, userId)`:
  ```ts
  const existing = await prisma.category.findFirst({ where: { id, userId } })
  if (!existing) throw new Error('Category not found')
  try {
    await prisma.category.delete({ where: { id } })
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2003'
    ) {
      throw new Error(
        'Category has associated transactions and cannot be deleted',
      )
    }
    throw err
  }
  ```
  > `P2003` is the FK-violation code that `onDelete: Restrict` triggers.
- `src/graphql/resolvers/category.resolver.ts` — add the `deleteCategory(@Arg('id'), @GqlUser() user)` mutation.

## Authorization

See [02 — Per-user scoping](./02-escopo-por-usuario.md).

## Cascade behaviour (locked decision)

`Transaction.categoryId` uses `onDelete: Restrict` (see [`03-criar-transacao.md`](./03-criar-transacao.md)). Deleting a category with transactions **fails** with a clear message. Deliberate decision — it avoids silent data loss; the frontend redirects the user to move/delete the transactions first.

Rejected alternative: `onDelete: Cascade` would delete the transactions without confirmation — dangerous.

## Testing

- `src/app/categories/delete-category.spec.ts`
  - [x] deleting a category with no linked transactions returns without error.
  - [ ] deleting a category with linked transactions throws `Category has associated transactions...`. _(deferred — depends on the `Transaction` model from tarefa 03)_
  - [x] nonexistent id → `Category not found`.
  - [x] another user's id → `Category not found`.
- `src/graphql/resolvers/category.resolver.spec.ts`
  - [x] mutation returns `true` on success.
  - [ ] translates `P2003` into a friendly message. _(deferred — depends on the `Transaction` model from tarefa 03)_

## Acceptance criteria

- [x] Delete with no linked transactions returns `true`.
- [ ] Delete with linked transactions throws `Category has associated transactions and cannot be deleted`. _(code ready; test depends on tarefa 03)_
- [x] Nonexistent id → `Category not found`.
- [x] Someone else's id → `Category not found`.
- [x] No JWT → `User not authenticated!`.
- [x] Suite green.

## Depends on

- [07 — Create category](./07-criar-categoria.md).
- [03 — Create transaction](./03-criar-transacao.md) (defines the FK that triggers `Restrict`).
- [01 — Create account and log in](./01-criar-conta-e-login.md).
- [02 — Per-user scoping](./02-escopo-por-usuario.md).

## Out of scope

- Bulk-moving transactions to another category.
- Soft delete / archiving.
