# Tarefa 07 — Deve ser possível criar uma categoria

> Origem: linha 64 da seção "Tarefas" em `requisitos.md`.
> Branch: `feat/07-criar-categoria`.

## Objetivo

Permitir ao usuário autenticado criar uma categoria para classificar suas transações.

## GraphQL surface

```graphql
input CreateCategoryInput {
  name: String!
  color: String!         # hex, ex.: '#FF5733'
  icon: String!          # identificador (ex.: nome de ícone Lucide)
  description: String
}

type Mutation {
  createCategory(data: CreateCategoryInput!): CategoryModel!
}
```

## Files to add or change

### Prisma
- `prisma/schema.prisma` — adicionar:
  ```prisma
  model Category {
    id          String   @id @default(uuid())
    name        String
    color       String
    icon        String
    description String?
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt

    userId       String
    user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)

    transactions Transaction[]
  }
  ```
- Rodar `pnpm migrate --name add-category`. (Vem **antes** da migration de Transaction na tarefa 03 — categoria precisa existir antes de qualquer FK apontar pra ela.)

### GraphQL surface
- `src/graphql/models/category.model.ts` — `@ObjectType CategoryModel`.
- `src/graphql/inputs/category.input.ts` — `CreateCategoryInput`.
- `src/graphql/resolvers/category.resolver.ts` — `@Resolver(() => CategoryModel) @UseMiddleware(IsAuth)`. Mutation `createCategory(@Arg('data'), @GqlUser() user)`.

### Business logic
- `src/app/categories/create-category.ts` — `export async function createCategory(input, userId)`:
  ```ts
  return prisma.category.create({ data: { ...input, userId } })
  ```

### Wiring
- `src/infra/http/server.ts` — registrar `CategoryResolver`.

## Authorization

Ver [02 — Escopo por usuário](./02-escopo-por-usuario.md). `userId` vem de `@GqlUser()`, **nunca** do input.

## Testing

- `src/app/categories/create-category.spec.ts`
  - [x] cria categoria e retorna o objeto com `userId` correto.
  - [x] `description` opcional vira `null` quando ausente.
- `src/graphql/resolvers/category.resolver.spec.ts`
  - [x] mutation `createCategory` com token cria.
  - [x] sem token → erro de autenticação.
- Atualizar `src/test/setup.ts` para `await prisma.category.deleteMany()` antes de `prisma.user.deleteMany()`.

## Acceptance criteria

- [x] Criar categoria válida retorna o objeto.
- [x] `color` armazenada como string (sem validação hex — frontend valida).
- [x] `description` opcional.
- [x] Sem JWT → `Usuário não autenticado!`.
- [x] Suite verde.

## Depends on

- [01 — Criar conta e login](./01-criar-conta-e-login.md).
- [02 — Escopo por usuário](./02-escopo-por-usuario.md).

## Out of scope

- Validação de cor (regex hex).
- Validação de nome único por usuário.
- Categorias-padrão pré-cadastradas (seed).
- Categorias compartilhadas / globais.
