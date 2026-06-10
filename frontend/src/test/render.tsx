import { apolloClient } from '@/lib/apollo'
import { ApolloProvider } from '@apollo/client/react'
import { type RenderOptions, render } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { MemoryRouter } from 'react-router'

type ProvidersProps = {
  children: ReactNode
  route?: string
}

function Providers({ children, route = '/' }: ProvidersProps) {
  return (
    <ApolloProvider client={apolloClient}>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </ApolloProvider>
  )
}

export function renderWithProviders(
  ui: ReactElement,
  {
    route,
    ...options
  }: { route?: string } & Omit<RenderOptions, 'wrapper'> = {},
) {
  return render(ui, {
    wrapper: ({ children }) => <Providers route={route}>{children}</Providers>,
    ...options,
  })
}
