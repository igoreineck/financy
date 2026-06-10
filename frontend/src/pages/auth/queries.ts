import { graphql } from '@/gql'

export const LoginMutation = graphql(`
  mutation Login($data: LoginInput!) {
    login(data: $data) {
      token
      user {
        id
        name
        email
      }
    }
  }
`)

export const RegisterMutation = graphql(`
  mutation Register($data: RegisterInput!) {
    register(data: $data) {
      token
      user {
        id
        name
        email
      }
    }
  }
`)

export const MeQuery = graphql(`
  query Me {
    me {
      id
      name
      email
    }
  }
`)
