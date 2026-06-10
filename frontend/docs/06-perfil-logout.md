# Tarefa 06 — Perfil + logout

> Branch: `feat/06-perfil-logout`. Workflow geral em [`README.md`](./README.md#workflow-per-tarefa).

## Objetivo

Página `/perfil` que mostra dados do usuário autenticado (`me` query) + user menu no navbar com avatar (iniciais) e ação "Sair da conta". Logout limpa store, limpa cache Apollo e redireciona pra `/login`.

## GraphQL surface (consumido)

```graphql
query Me {
  me {
    id
    name
    email
    createdAt
  }
}
```

Documento em `src/pages/profile/queries.graphql`.

## Files to add or change

### Página

- `src/pages/profile/profile-page.tsx`
  - Card centralizado com avatar grande (iniciais), nome, email.
  - Loading state com `<Skeleton>` enquanto `me` carrega.
  - Botão "Sair da conta" no rodapé.

### Layout

- `src/components/layout/app-layout.tsx`
  - Navbar persistente: Logo · links Dashboard / Transações / Categorias · `<UserMenu>` à direita.
  - `<Outlet />` no centro.
- `src/components/layout/navbar.tsx`
  - Lê auth state pra mostrar avatar.
- `src/components/layout/user-menu.tsx`
  - Avatar com iniciais extraídas do `user.name` (`Conta Teste` → `CT`).
  - Click abre dropdown (Radix DropdownMenu) com 2 items: "Meu perfil" (link `/perfil`) + "Sair da conta" (chama logout handler).
  - Ou click direto navega pra `/perfil` — confirmar no PR.

### Helpers

- `src/lib/initials.ts` — `getInitials(name: string): string`. Casos: `'Conta Teste' → 'CT'`, `'Igor' → 'I'`, `'Igor Eineck Borges' → 'IE'`, string vazia → `'?'`.

### Logout flow

- `useLogout()` hook em `src/store/auth.ts` (ou helper em `src/lib/auth.ts`):
  1. `apolloClient.clearStore()` (limpa cache).
  2. `useAuthStore.getState().logout()` (limpa state + storage).
  3. `navigate('/login', { replace: true })`.

### Routes

- `src/routes.tsx` — adicionar `/perfil` dentro do `<ProtectedRoute>`.

## Testing

- [ ] `pages/profile/profile-page.spec.tsx`
  - Renderiza nome e email do `me`.
  - Loading state com skeleton enquanto query roda.
  - Click "Sair da conta" dispara o flow (mockar logout helper).
- [ ] `components/layout/user-menu.spec.tsx`
  - Avatar mostra iniciais corretas.
  - Click abre dropdown com 2 items.
  - Click "Sair" chama logout helper.
- [ ] `lib/initials.spec.ts` — todos os casos listados acima.
- [ ] `logout.integration.spec.tsx` (MSW)
  - Estado autenticado → click logout → store.isAuthenticated=false, localStorage limpo, Apollo cache vazio, redirect `/login`.
  - Request a uma protected query depois falha por falta de header (MSW retorna 401).

## Acceptance criteria

- [ ] Avatar com iniciais visível no navbar em toda página logada.
- [ ] Click avatar abre dropdown OU navega direto pra `/perfil` (definir no PR).
- [ ] `/perfil` mostra nome e email vindos da query `me`.
- [ ] Logout limpa store, limpa Apollo cache, redireciona pra `/login`.
- [ ] Após logout, refresh da página não restaura sessão.
- [ ] `pnpm test` verde; `pnpm check` limpo; `pnpm tsc --noEmit` limpo.
- [ ] `docs/06-perfil-logout.md` (este arquivo) com checkboxes preenchidos.

## Depends on

- [`00-scaffolding.md`](./00-scaffolding.md), [`01-design-system.md`](./01-design-system.md), [`02-auth.md`](./02-auth.md).
- Backend já expõe `query me` (confirmado em `backend/schema.graphql`).

## Out of scope

- Editar nome / email / senha do usuário.
- Excluir conta.
- Foto de perfil (avatar é só iniciais).
- Histórico de sessões / dispositivos.
