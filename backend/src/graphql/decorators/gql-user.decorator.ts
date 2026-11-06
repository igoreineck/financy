import { createParameterDecorator } from 'type-graphql'

import type { SafeUser } from '@/app/auth/register-user'
import type { GraphqlContext } from '@/graphql/context'
import { prisma } from '@/infra/db/prisma'

export function GqlUser() {
  return createParameterDecorator<GraphqlContext>(
    async ({ context }): Promise<SafeUser> => {
      if (!context.user) {
        throw new Error('User not authenticated!')
      }

      const user = await prisma.user.findUnique({
        where: { id: context.user },
        omit: { password: true },
      })

      if (!user) {
        throw new Error('User not authenticated!')
      }

      return user
    },
  )
}
