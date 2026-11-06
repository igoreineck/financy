import type { User } from '@prisma/client'

import { prisma } from '@/infra/db/prisma'
import { hashPassword } from '@/shared/hash'
import { signJwt } from '@/shared/jwt'

type RegisterUserInput = {
  name: string
  email: string
  password: string
}

export type SafeUser = Omit<User, 'password'>

type RegisterUserOutput = {
  token: string
  user: SafeUser
}

export async function registerUser({
  name,
  email,
  password,
}: RegisterUserInput): Promise<RegisterUserOutput> {
  const normalizedEmail = email.trim().toLowerCase()

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })
  if (existing) {
    throw new Error('Email already registered!')
  }

  const hashed = await hashPassword(password)

  const { password: _, ...user } = await prisma.user.create({
    data: { name, email: normalizedEmail, password: hashed },
  })

  const token = signJwt({ id: user.id, email: user.email })

  return { token, user }
}
