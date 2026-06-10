# Tarefa 04 — Transações CRUD

> Origem: linhas 75–78 (criar/deletar/editar/listar transação) em `requisitos.md`.
> Branch: `feat/04-transacoes-crud`. Workflow geral em [`README.md`](./README.md#workflow-per-tarefa).

## Objetivo

Página `/transacoes` com tabela + filtros + paginação + dialog create/edit + confirm de delete. Cobre as 4 operações de transação. Filtros e paginação são **client-side** porque o schema não tem args — documentar pra futura migração.

## GraphQL surface (consumido)

```graphql
query ListTransactions {
  listTransactions {
    id
    description
    amount       # Int (centavos)
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

Documentos em `src/pages/transactions/queries.graphql`.

## Files to add or change

### Página e componentes

- `src/pages/transactions/transactions-page.tsx`
  - Header: título "Transações", subtítulo, botão "Nova transação".
  - Barra de filtros (search por descrição + tipo + categoria + período).
  - Tabela com colunas: Descrição · Data · Categoria (Tag) · Tipo (TypeBadge) · Valor (com sinal) · Ações.
  - Paginação: "1 a 10 | 27 resultados" no rodapé.
  - Empty state quando zero transações ou filtro retorna zero.
- `src/pages/transactions/components/transaction-row.tsx` — uma linha (description, formatted date, `<Tag>` da categoria, `<TypeBadge>`, `formatCurrencyCents(amount)` prefixado com `+`/`-`, icon-buttons edit/delete).
- `src/pages/transactions/components/transaction-dialog.tsx`
  - Props: `{ open, onOpenChange, mode: 'create' | 'edit', initialValues? }`.
  - Toggle Type (Despesa / Receita) no topo — visual destacado, controla cor do header.
  - Inputs: descrição (text), valor (`<CurrencyInput>` que retorna centavos), data (input `type="date"`), categoria (`<Select>` populado por `ListCategories` da cache).
  - RHF + Zod: descrição required, amount > 0, occurredAt válido, categoryId required.
- `src/pages/transactions/components/transaction-filters.tsx`
  - Search: input com ícone de lupa, filtra `description.toLowerCase().includes(query.toLowerCase())`.
  - Tipo: select `Todos | Receita | Despesa`.
  - Categoria: select populado por `ListCategories` + opção "Todas".
  - Período: select `Este mês | Mês passado | Todo o período | Personalizado` (custom abre 2 date inputs).
- `src/pages/transactions/components/transaction-delete-confirm.tsx` — confirm dialog.

### Helpers

- `src/lib/format.ts`
  - `formatCurrencyCents(cents: number): string` → `'R$ 12,34'`.
  - `parseCurrencyToCents(input: string): number` → `1234`.
  - `formatDate(iso: string): string` → `'30/11/25'`.
- `src/components/ui/currency-input.tsx` — input com máscara live `R$ 0,00`. Emite centavos via `onChange(cents)`. Construído sobre o `<Input>` da tarefa 01.
- `src/pages/transactions/hooks/use-filtered-transactions.ts` — recebe `transactions` + `filters` + `page` + `pageSize`, retorna `{ rows, total, totalPages }`.

### Cache strategy

- `createTransaction` / `updateTransaction` — `update(cache, { data })` insere/atualiza na lista da query `ListTransactions`.
- `deleteTransaction` — `cache.modify` remove o id.
- Erro do backend → toast com mensagem.

## Testing

- [ ] `pages/transactions/transactions-page.spec.tsx`
  - Renderiza 10 linhas + indicador `1 a 10 | 27 resultados`.
  - Click em "Próxima página" mostra restantes.
  - Empty state quando filtro retorna vazio.
- [ ] `pages/transactions/components/transaction-filters.spec.tsx`
  - Search filtra por descrição (case-insensitive, substring).
  - Tipo filtra apenas INCOME / EXPENSE.
  - Categoria filtra; "Todas" desliga o filtro.
  - Período "Este mês" mostra só as do mês corrente; "Personalizado" filtra range custom.
  - Filtros combinam (AND).
- [ ] `pages/transactions/components/transaction-dialog.spec.tsx`
  - Toggle Despesa/Receita altera classe visível.
  - `<CurrencyInput>` digitando "12,34" emite `1234`.
  - Submit valida obrigatórios; submit válido chama mutation com input certo.
  - Modo edit pre-popula tudo (incluindo categoria selecionada).
- [ ] `pages/transactions/components/transaction-delete-confirm.spec.tsx` — confirmar chama mutation; cancelar fecha.
- [ ] `pages/transactions/hooks/use-filtered-transactions.spec.ts`
  - Total recalcula com filtros aplicados.
  - Paginação respeita filtros.
  - Trocar filtro reseta pra página 1.
- [ ] `lib/format.spec.ts`
  - `formatCurrencyCents(1234) === 'R$ 12,34'`.
  - `formatCurrencyCents(0) === 'R$ 0,00'`.
  - `formatCurrencyCents(1234567) === 'R$ 12.345,67'`.
  - `parseCurrencyToCents('R$ 12,34') === 1234`.
  - `parseCurrencyToCents('12,34') === 1234`.
  - `parseCurrencyToCents('R$ 12.345,67') === 1234567`.
  - `formatDate('2025-11-30T00:00:00Z') === '30/11/25'`.
- [ ] `transactions.integration.spec.tsx` (MSW)
  - Lista carrega; create insere linha; update atualiza linha; delete remove linha.

## Acceptance criteria

- [ ] Tabela com colunas: Descrição, Data, Categoria (Tag), Tipo (TypeBadge), Valor (formatado com sinal), Ações.
- [ ] "Nova transação" abre dialog limpo; edit abre pré-preenchido (incluindo categoria).
- [ ] Deletar pede confirmação; após confirmar, linha some.
- [ ] Filtros combinam (AND); paginação recomputa total com filtros aplicados.
- [ ] Valor enviado ao backend é Int em centavos.
- [ ] Toasts em sucesso e erro de cada operação.
- [ ] Linhas em `requisitos.md`: criar/deletar/editar/listar transação marcadas.
- [ ] `pnpm test` verde; `pnpm check` limpo; `pnpm tsc --noEmit` limpo.
- [ ] `docs/04-transacoes-crud.md` (este arquivo) com checkboxes preenchidos.

## Depends on

- [`00-scaffolding.md`](./00-scaffolding.md), [`01-design-system.md`](./01-design-system.md), [`02-auth.md`](./02-auth.md).
- [`03-categorias-crud.md`](./03-categorias-crud.md) — precisa de categorias pra escolher no select.
- Backend `03/04/05/06` (transações CRUD) já mergeados.

## Out of scope

- Filtros server-side (backend não suporta args).
- Transações recorrentes.
- Anexos / comprovantes.
- Multi-currency.
- Bulk delete / import CSV.
