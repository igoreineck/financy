import { createParameterDecorator } from 'type-graphql'

import type { GraphqlContext } from '@/graphql/context'

export function GqlUserId() {
  return createParameterDecorator<GraphqlContext>(({ context }) => {
    if (!context.user) {
      throw new Error('Usuário não autenticado!')
    }
    return context.user
  })
}
