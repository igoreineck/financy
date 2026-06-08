import type { User } from '@prisma/client'

import { prisma } from '@/infra/db/prisma'
import { hashPassword } from '@/shared/hash'
import { signJwt } from '@/shared/jwt'

type RegisterUserInput = {
  name: string
  email: string
  password: string
}

type RegisterUserOutput = {
  token: string
  user: User
}

export async function registerUser({
  name,
  email,
  password,
}: RegisterUserInput): Promise<RegisterUserOutput> {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new Error('E-mail já cadastrado!')
  }

  const hashed = await hashPassword(password)

  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  })

  const token = signJwt({ id: user.id, email: user.email })

  return { token, user }
}
