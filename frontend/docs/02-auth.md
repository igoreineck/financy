# Tarefa 02 — Auth (create account + login)

> Origin: line 73 of the "Tarefas" section in `requisitos.md`.
> Branch: `feat/02-auth`. General workflow in [`README.md`](./README.md#workflow-per-tarefa).

## Goal

`/login` and `/signup` pages + Apollo mutations (`login`, `register`) + populating `useAuthStore` + Apollo `setContext` injecting `Authorization: Bearer <token>` on every request + route guards. After a successful login, redirects to `/` (Dashboard placeholder).

## GraphQL surface (consumed — already exists in the backend)

```graphql
mutation Login($data: LoginInput!) {
  login(data: $data) {
    token
    user { id name email }
  }
}

mutation Register($data: RegisterInput!) {
  register(data: $data) {
    token
    user { id name email }
  }
}
```

> Documents live in `src/pages/auth/queries.graphql` and are read by codegen to generate `LoginDocument` + `useLoginMutation` in `src/gql/`.

## Files to add or change

### Pages

- `src/pages/auth/login.tsx` — form with email + password + "Remember me" checkbox + "Forgot password" link (inert) + "Sign in" button + "Create account" link.
- `src/pages/auth/sign-up.tsx` — form with name + email + password + confirm password + "Sign up" button + "Already have an account? Log in" link.
- `src/pages/auth/components/auth-card.tsx` — visual shell (centered 448px container + header with title and subtitle + slot for the form + slot for the footer link).

### State and infra

- `src/store/auth.ts` — final:
  ```ts
  type AuthState = {
    token: string | null
    user: { id: string; name: string; email: string } | null
    isAuthenticated: boolean
    setSession: (data: { token: string; user: ... }) => void
    logout: () => void
  }
  ```
  `persist` with key `'financy-auth'` in `localStorage`. If "Remember me" is unchecked, use `sessionStorage` via `createJSONStorage(() => sessionStorage)` dynamically — confirm the UX in the PR.

- `src/lib/apollo.ts` — final:
  ```ts
  const authLink = setContext((_, { headers }) => {
    const token = useAuthStore.getState().token
    return { headers: { ...headers, authorization: token ? `Bearer ${token}` : '' } }
  })
  export const apolloClient = new ApolloClient({
    link: from([authLink, new HttpLink({ uri: env.VITE_BACKEND_URL })]),
    cache: new InMemoryCache(),
  })
  ```

### Guards and layout

- `src/components/guards/protected-route.tsx` — `useAuthStore(s => s.isAuthenticated)`; not authenticated → `<Navigate to="/login" replace />`.
- `src/components/guards/public-route.tsx` — authenticated → `<Navigate to="/" replace />`.
- `src/components/layout/public-layout.tsx` — header with just a centered `<LogoIcon />`, `<Outlet />` in the center.
- `src/routes.tsx` — updated:
  ```tsx
  createBrowserRouter([
    { element: <PublicLayout />, children: [
      { path: '/login', element: <PublicRoute><Login /></PublicRoute> },
      { path: '/signup', element: <PublicRoute><SignUp /></PublicRoute> },
    ]},
    { element: <ProtectedRoute><AppLayout /></ProtectedRoute>, children: [
      { path: '/', element: <DashboardPlaceholder /> },
    ]},
  ])
  ```

### Forms

- React Hook Form + Zod. Schemas inline in the page (brev.ly style):

```ts
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})
type LoginForm = z.infer<typeof loginSchema>
```

Parse in `onSubmit` (`schema.parse(data)`) — no Zod resolver in `useForm`.

### Client-side validation (sign-up)

- `name` required.
- `email` valid format.
- `password` at least 6 characters.
- `confirmPassword` equal to `password` (cross-field validation via `refine`).

Error messages in English.

## Testing

- [x] `pages/auth/login.spec.tsx`
  - Render shows fields and button.
  - Submit with valid email/password (MSW) calls the mutation, the store is populated, `useNavigate` redirects to `/` (renders the dashboard placeholder).
  - Mutation rejected with `Invalid password!` (MSW) shows a `sonner` toast with the message.
  - Client validation blocks submit with invalid fields.
- [x] `pages/auth/sign-up.spec.tsx`
  - Client validation: password < 6 blocks; confirmation ≠ password blocks.
  - Valid submit calls `register` (MSW), the store is populated, redirects to the dashboard placeholder.
  - Backend rejects with `Email already registered!` → toast.
- [x] `store/auth.spec.ts`
  - `setSession` populates `token`, `user`, `isAuthenticated=true`.
  - `logout` clears everything.
  - Persists under `financy-auth` in `localStorage`.
- [x] `components/guards/protected-route.spec.tsx`
  - No token → redirects to `/login` via `<Navigate>`.
  - With token → renders `children`.
- [x] `components/guards/public-route.spec.tsx` — mirror of the previous one (redirects to `/` when authenticated).
- [ ] `auth.integration.spec.tsx` — covered inline by the `login.spec.tsx` and `sign-up.spec.tsx` specs (each runs the `/login` or `/signup` flow → MSW submit → dashboard placeholder + populated store). Separate spec removed to avoid duplication.

## Acceptance criteria

- [x] Login with valid credentials redirects to `/`.
- [x] A successful sign-up authenticates right away and redirects to `/`.
- [x] Backend errors show up in a Sonner toast.
- [x] "Forgot password" visible but inert (`aria-disabled`, `title="Coming soon"`, no handler).
- [x] "Remember me": default = checkbox **unchecked** (privacy first — the user decides explicitly). Checked → session persists in `localStorage`. Unchecked → session in `sessionStorage` (gone when the tab/browser closes). Implemented via a dual storage adapter in `useAuthStore` that reads a versioned flag (`financy-remember-v1`) to decide the destination on every read/write.
- [x] Reloading the page with a valid token keeps the session (Zustand `persist` in `localStorage` + the Apollo authLink reads the token on every request).
- [x] Line in `requisitos.md` checked.
- [x] `pnpm test` green; `pnpm check` clean; `pnpm tsc --noEmit` clean.
- [x] `docs/02-auth.md` (this file) with checkboxes filled in.

## Depends on

- [`00-scaffolding.md`](./00-scaffolding.md) — Apollo + Zustand + routing infra.
- [`01-design-system.md`](./01-design-system.md) — `<Button>`, `<Input>`, `<Label>`, `<Link>`, `<Toaster>`, `<LogoIcon>`.
- Backend `01 — Create account and log in` already merged (confirmed: `f36d32a`).

## Out of scope

- Refresh token rotation (the backend doesn't support it).
- Password recovery.
- Email verification.
- OAuth / social login.
- Client-side rate limiting.
