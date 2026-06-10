import { Toaster } from '@/components/ui/sonner'
import { apolloClient } from '@/lib/apollo'
import { router } from '@/routes'
import { ApolloProvider } from '@apollo/client/react'
import { RouterProvider } from 'react-router/dom'

export function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <RouterProvider router={router} />
      <Toaster />
    </ApolloProvider>
  )
}
