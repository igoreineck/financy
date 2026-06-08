# Tarefa 09 — Deve ser possível editar uma categoria

> Origem: linha 66 da seção "Tarefas" em `requisitos.md`.
> Branch: `feat/09-editar-categoria`.

## Objetivo

Atualizar campos de uma categoria existente do próprio usuário.

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

Todos opcionais.

## Files to add or change

- `src/graphql/inputs/category.input.ts` — adicionar `UpdateCategoryInput`.
- `src/app/categories/update-category.ts` — `export async function updateCategory(id, data, userId)`:
  ```ts
  const existing = await prisma.category.findFirst({ where: { id, userId } })
  if (!existing) throw new Error('Categoria não encontrada')
  return prisma.category.update({ where: { id }, data })
  ```
- `src/graphql/resolvers/category.resolver.ts` — adicionar mutation `updateCategory(@Arg('id'), @Arg('data'), @GqlUser() user)`.

## Authorization

Ver [02 — Escopo por usuário](./02-escopo-por-usuario.md).

## Testing

- `src/app/categories/update-category.spec.ts`
  - [ ] update parcial preserva campos não enviados.
  - [ ] id alheio → `Categoria não encontrada`.
  - [ ] `updatedAt` é atualizado.
- `src/graphql/resolvers/category.resolver.spec.ts`
  - [ ] mutation retorna o objeto atualizado.
  - [ ] usuário A não consegue editar categoria de B.

## Acceptance criteria

- [ ] Update parcial só altera os campos enviados.
- [ ] Update cross-user → `Categoria não encontrada`.
- [ ] `updatedAt` atualizado automaticamente.
- [ ] Sem JWT → `Usuário não autenticado!`.
- [ ] Suite verde.

## Depends on

- [07 — Criar categoria](./07-criar-categoria.md).
- [01 — Criar conta e login](./01-criar-conta-e-login.md).
- [02 — Escopo por usuário](./02-escopo-por-usuario.md).

## Out of scope

- Histórico de versões.
- Decisão sobre `description: null` (limpar vs. não-enviado): seguir a regra do TypeGraphQL — campo não enviado = `undefined`, e o Prisma ignora `undefined`. `null` explícito limpa.
