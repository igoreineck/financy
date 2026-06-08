import { createParameterDecorator } from 'type-graphql'

import type { GraphqlContext } from '@/graphql/context'
import { prisma } from '@/infra/db/prisma'

export function GqlUser() {
  return createParameterDecorator<GraphqlContext>(async ({ context }) => {
    if (!context.user) {
      throw new Error('Usuário não autenticado!')
    }

    const user = await prisma.user.findUnique({
      where: { id: context.user },
    })

    if (!user) {
      throw new Error('Usuário não autenticado!')
    }

    return user
  })
}
