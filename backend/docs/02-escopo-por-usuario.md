# Tarefa 02 — O usuário pode ver e gerenciar apenas as transações e categorias criadas por ele

> Origem: linha 59 da seção "Tarefas" em `requisitos.md`.
> Branch: `feat/02-escopo-por-usuario` (opcional — esta tarefa pode entrar como parte do PR da 03 ou 07 se ainda não houver nada concreto a entregar).

## Objetivo

Regra transversal: cada usuário só enxerga e modifica os próprios dados. Esta tarefa não introduz endpoint próprio — define o invariante que as tarefas 03–10 implementam.

## GraphQL surface

Não introduz tipos, queries ou mutations próprios.

## Invariante a ser implementado nas demais tarefas

Em **todo** resolver que leia ou escreva `Category` ou `Transaction`:

1. Classe ou método decorado com `@UseMiddleware(IsAuth)`.
2. Resolver recebe o usuário autenticado via `@GqlUser() user: UserModel`.
3. **Toda** chamada a `prisma.category.*` ou `prisma.transaction.*` inclui `where: { ..., userId: user.id }`.
4. Operações de update/delete usam `prisma.<model>.findFirst({ where: { id, userId } })` **antes** da mutação, lançando "não encontrado" se vazio. Nunca `findUnique({ where: { id } })` + check em memória; nunca `update({ where: { id } })` direto.
5. Em `createTransaction`, se o input traz `categoryId`, **revalidar** que a categoria pertence ao mesmo usuário antes do insert.
6. `FieldResolver`s que carregam relações (ex.: `Transaction.category`) podem usar `findUnique` — o pai já foi escopado por `userId`, então a relação inevitavelmente pertence ao mesmo usuário.
7. **Mensagens de erro não vazam existência**: "Categoria não encontrada" deve ser idêntico se o id não existe ou se pertence a outro usuário.

## Files to add or change

Nenhum arquivo próprio. As implementações concretas vivem nas tarefas:

- [03 — Criar transação](./03-criar-transacao.md)
- [04 — Deletar transação](./04-deletar-transacao.md)
- [05 — Editar transação](./05-editar-transacao.md)
- [06 — Listar transações](./06-listar-transacoes.md)
- [07 — Criar categoria](./07-criar-categoria.md)
- [08 — Deletar categoria](./08-deletar-categoria.md)
- [09 — Editar categoria](./09-editar-categoria.md)
- [10 — Listar categorias](./10-listar-categorias.md)

## Testing

Esta tarefa **não tem testes próprios**. Cada tarefa 03–10 ship o teste de IDOR/ownership descrito em CLAUDE.md > Testing > "Smoke test for ownership". Sugestão de helper compartilhado, criado na primeira tarefa que precisar:

- `src/test/helpers/create-test-user.ts` — `export async function createTestUser(overrides?)` que chama `registerUser` com dados fake (`@faker-js/faker`) e retorna `{ user, token }`. Usado por todos os testes de resolvers/services.

## Acceptance criteria

Validado nas tarefas 03–10. A matriz:

- [ ] Usuário A não vê transações/categorias do B em nenhum list/query.
- [ ] Usuário A não consegue atualizar/excluir transação ou categoria do B (mesmo com o id correto) — erro "não encontrado", **mesma mensagem** que id inexistente.
- [ ] Usuário A não consegue criar transação referenciando `categoryId` do B.
- [ ] Resolver protegido sem token / com token inválido → `Usuário não autenticado!`.

## Depends on

- [01 — Criar conta e login](./01-criar-conta-e-login.md).

## Out of scope

- Roles / permissões além de "dono do recurso".
- Soft delete / auditoria.
- Compartilhamento entre usuários.
