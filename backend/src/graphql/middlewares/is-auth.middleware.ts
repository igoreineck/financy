import type { MiddlewareFn } from 'type-graphql'

import type { GraphqlContext } from '@/graphql/context'

export const IsAuth: MiddlewareFn<GraphqlContext> = async (
  { context },
  next,
) => {
  if (context.authError === 'expired') {
    throw new Error('Session expired!')
  }
  if (context.authError === 'invalid') {
    throw new Error('Invalid token!')
  }
  if (!context.user) {
    throw new Error('User not authenticated!')
  }
  return next()
}
