# Tarefa 08 — Deve ser possível deletar uma categoria

> Origem: linha 65 da seção "Tarefas" em `requisitos.md`.
> Branch: `feat/08-deletar-categoria`.

## Objetivo

Excluir uma categoria do próprio usuário **desde que não haja transações vinculadas**.

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
  if (!existing) throw new Error('Categoria não encontrada')
  try {
    await prisma.category.delete({ where: { id } })
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2003'
    ) {
      throw new Error(
        'Categoria possui transações associadas e não pode ser excluída',
      )
    }
    throw err
  }
  ```
  > `P2003` é o código de violação de FK que o `onDelete: Restrict` dispara.
- `src/graphql/resolvers/category.resolver.ts` — adicionar mutation `deleteCategory(@Arg('id'), @GqlUser() user)`.

## Authorization

Ver [02 — Escopo por usuário](./02-escopo-por-usuario.md).

## Cascade behaviour (decisão travada)

`Transaction.categoryId` usa `onDelete: Restrict` (ver [`03-criar-transacao.md`](./03-criar-transacao.md)). Deletar categoria com transações **falha** com mensagem clara. Decisão deliberada — evita perda silenciosa; o frontend reroteia o usuário para mover/excluir transações primeiro.

Alternativa rejeitada: `onDelete: Cascade` apagaria as transações sem confirmação — perigoso.

## Testing

- `src/app/categories/delete-category.spec.ts`
  - [x] delete de categoria sem transações vinculadas retorna sem erro.
  - [ ] delete de categoria com transações vinculadas lança `Categoria possui transações associadas...`. _(deferred — depende do modelo `Transaction` em tarefa 03)_
  - [x] id inexistente → `Categoria não encontrada`.
  - [x] id de outro usuário → `Categoria não encontrada`.
- `src/graphql/resolvers/category.resolver.spec.ts`
  - [x] mutation retorna `true` em sucesso.
  - [ ] traduz `P2003` em mensagem amigável. _(deferred — depende do modelo `Transaction` em tarefa 03)_

## Acceptance criteria

- [x] Delete sem transações vinculadas retorna `true`.
- [ ] Delete com transações vinculadas lança `Categoria possui transações associadas e não pode ser excluída`. _(código pronto; teste depende de tarefa 03)_
- [x] Id inexistente → `Categoria não encontrada`.
- [x] Id alheio → `Categoria não encontrada`.
- [x] Sem JWT → `Usuário não autenticado!`.
- [x] Suite verde.

## Depends on

- [07 — Criar categoria](./07-criar-categoria.md).
- [03 — Criar transação](./03-criar-transacao.md) (define o FK que dispara o `Restrict`).
- [01 — Criar conta e login](./01-criar-conta-e-login.md).
- [02 — Escopo por usuário](./02-escopo-por-usuario.md).

## Out of scope

- Mover transações em massa para outra categoria.
- Soft delete / arquivamento.
