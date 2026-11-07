# Tarefa 06 — Profile + logout

> Branch: `feat/06-perfil-logout`. General workflow in [`README.md`](./README.md#workflow-per-tarefa).

## Goal

`/profile` page showing the authenticated user's data (`me` query) + a user menu in the navbar with an avatar (initials) and a "Log out" action. Logout clears the store, clears the Apollo cache, and redirects to `/login`.

## GraphQL surface (consumed)

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

Document in `src/pages/profile/queries.graphql`.

## Files to add or change

### Page

- `src/pages/profile/profile-page.tsx`
  - Centered card with a large avatar (initials), name, email.
  - Loading state with `<Skeleton>` while `me` loads.
  - "Log out" button in the footer.

### Layout

- `src/components/layout/app-layout.tsx`
  - Persistent navbar: Logo · Dashboard / Transactions / Categories links · `<UserMenu>` on the right.
  - `<Outlet />` in the center.
- `src/components/layout/navbar.tsx`
  - Reads auth state to show the avatar.
- `src/components/layout/user-menu.tsx`
  - Avatar with initials extracted from `user.name` (`Conta Teste` → `CT`).
  - Click opens a dropdown (Radix DropdownMenu) with 2 items: "My profile" (link to `/profile`) + "Log out" (calls the logout handler).
  - Or a direct click navigates to `/profile` — confirm in the PR.

### Helpers

- `src/lib/initials.ts` — `getInitials(name: string): string`. Cases: `'Conta Teste' → 'CT'`, `'Igor' → 'I'`, `'Igor Eineck Borges' → 'IE'`, empty string → `'?'`.

### Logout flow

- `useLogout()` hook in `src/store/auth.ts` (or a helper in `src/lib/auth.ts`):
  1. `apolloClient.clearStore()` (clears the cache).
  2. `useAuthStore.getState().logout()` (clears state + storage).
  3. `navigate('/login', { replace: true })`.

### Routes

- `src/routes.tsx` — add `/profile` inside `<ProtectedRoute>`.

## Testing

- [x] `pages/profile/profile-page.spec.tsx`
  - Renders the name and email from `me`.
  - Loading state with a skeleton while the query runs.
  - Clicking "Log out" triggers the flow (logout helper mocked).
- [x] `components/layout/user-menu.spec.tsx`
  - Avatar shows the correct initials.
  - Click opens the dropdown with 2 items.
  - Clicking "Log out" calls the logout helper.
- [x] `lib/initials.spec.ts` — all the cases listed above.
- [x] `logout.integration.spec.tsx` (MSW)
  - Authenticated state → click logout → store.isAuthenticated=false, the persisted snapshot only holds the cleared state, Apollo cache empty, redirect to `/login`.

## Acceptance criteria

- [x] Avatar with initials visible in the navbar on every logged-in page.
- [x] Clicking the avatar opens a dropdown with "My profile" + "Log out".
- [x] `/profile` shows the name and email from the `me` query.
- [x] Logout clears the store, clears the Apollo cache, redirects to `/login`.
- [x] After logout, reloading the page doesn't restore the session (the persisted snapshot has `token:null`).
- [x] `pnpm test` green; `pnpm check` clean; `pnpm tsc --noEmit` clean.
- [x] `docs/06-perfil-logout.md` (this file) with checkboxes filled in.

## Depends on

- [`00-scaffolding.md`](./00-scaffolding.md), [`01-design-system.md`](./01-design-system.md), [`02-auth.md`](./02-auth.md).
- The backend already exposes `query me` (confirmed in `backend/schema.graphql`).

## Out of scope

- Editing the user's name / email / password.
- Deleting the account.
- Profile photo (the avatar is just initials).
- Session / device history.
