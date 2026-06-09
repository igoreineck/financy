import type { MiddlewareFn } from 'type-graphql'

import type { GraphqlContext } from '@/graphql/context'

export const IsAuth: MiddlewareFn<GraphqlContext> = async (
  { context },
  next,
) => {
  if (context.authError === 'expired') {
    throw new Error('Sessão expirada!')
  }
  if (context.authError === 'invalid') {
    throw new Error('Token inválido!')
  }
  if (!context.user) {
    throw new Error('Usuário não autenticado!')
  }
  return next()
}
