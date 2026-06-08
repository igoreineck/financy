import type { User } from '@prisma/client'

import { prisma } from '@/infra/db/prisma'
import { comparePassword } from '@/shared/hash'
import { signJwt } from '@/shared/jwt'

type LoginUserInput = {
  email: string
  password: string
}

type LoginUserOutput = {
  token: string
  user: User
}

export async function loginUser({
  email,
  password,
}: LoginUserInput): Promise<LoginUserOutput> {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new Error('Usuário não cadastrado!')
  }

  const ok = await comparePassword(password, user.password)
  if (!ok) {
    throw new Error('Senha inválida!')
  }

  const token = signJwt({ id: user.id, email: user.email })

  return { token, user }
}
