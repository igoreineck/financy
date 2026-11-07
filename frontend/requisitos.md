### Frontend description and functional requirements

In this frontend project you will build a React application that, together with the API, allows managing transactions and categories.

#### Features and rules

Just like in the API, we have the following features and rules:

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

In addition, there are some important frontend-specific rules:

- You must build a React application that uses GraphQL to query the API and Vite as the `bundler`;
- Follow the Figma layout as faithfully as possible;

#### Pages

This application has 6 pages and two modals with the forms (Dialog):

- The root page (`/`), which shows:
  - The login screen if the user is logged out
  - The dashboard screen if the user is logged in

#### Environment variables

Every project has several configuration variables that must differ depending on the environment it runs in. So it's important to know, in an easy and intuitive way, which variables those are. Therefore this project must have a `.env.example` file with the required keys:

```
VITE_BACKEND_URL=
```

#### Good practices

- Start the project from the `Style Guide` tab in Figma. That way you prepare your whole theme, fonts, and components, and building the pages will be much smoother;
- Just as user experience (UX) matters, your development experience (DX) matters a lot too. So, although it's possible to build this application without any library, we recommend using some libraries that will make both the initial development and the code maintenance easier;

#### Non-functional requirements

The following are mandatory:

- Typescript
- React
- Vite without a framework
- GraphQL

The following are optional:

- TailwindCSS
- Shadcn
- React Query
- React Hook Form
- Zod



### Reference project for the frontend

- Link: https://github.com/rocketseat-education/ftr-pos-360-mindshare/tree/main/frontend

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
