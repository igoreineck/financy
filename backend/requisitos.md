### Backend description and functional requirements

In this backend project, you will build an API to manage personal-finance organization.

#### Features and rules

- The user can create an account and log in
- The user can only see and manage the transactions and categories they created
- It must be possible to create a transaction
- It must be possible to delete a transaction
- It must be possible to edit a transaction
- It must be possible to list all transactions
- It must be possible to create a category
- It must be possible to delete a category
- It must be possible to edit a category
- It must be possible to list all categories

------

⚠️ For this challenge you are expected to use the SQLite database. If you prefer, you may use Postgres instead.

------

#### Environment variables

Every project has several configuration variables that must differ depending on the environment it runs in. So it's important to know, in an easy and intuitive way, which variables those are. Therefore this project must have a `.env.example` file with the required keys.

```
JWT_SECRET=
DATABASE_URL=
```

If you add extra variables, remember to include them in `.env.example`.

#### Non-functional requirements

The following are mandatory:

- TypeScript
- GraphQL
- Prisma
- SQLite

#### Good practices

- Don't forget to enable CORS in the application.



### Reference project for the backend

- Link: https://github.com/rocketseat-education/ftr-pos-360-mindshare/tree/main/backend

---

## Tarefas

- [x] The user can create an account and log in
- [x] The user can only see and manage the transactions and categories they created
- [x] It must be possible to create a transaction
- [x] It must be possible to delete a transaction
- [x] It must be possible to edit a transaction
- [x] It must be possible to list all transactions
- [x] It must be possible to create a category
- [x] It must be possible to delete a category
- [x] It must be possible to edit a category
- [x] It must be possible to list all categories

## Nice to have (future)

Items outside the challenge's mandatory scope, kept as ideas for evolving the project later.

- [ ] [Harden authentication (rotation, revocation, and refresh tokens)](./docs/nice-to-have-fortalecer-autenticacao.md)
