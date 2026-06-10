import { env } from '@/env'
import { useAuthStore } from '@/store/auth'
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { SetContextLink } from '@apollo/client/link/context'

const authLink = new SetContextLink(prevContext => {
  const token = useAuthStore.getState().token
  return {
    headers: {
      ...prevContext.headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

export const apolloClient = new ApolloClient({
  link: authLink.concat(new HttpLink({ uri: env.VITE_API_URL })),
  cache: new InMemoryCache(),
})
