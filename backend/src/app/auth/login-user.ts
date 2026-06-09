import { prisma } from '@/infra/db/prisma'
import { comparePassword } from '@/shared/hash'
import { signJwt } from '@/shared/jwt'
import type { SafeUser } from './register-user'

type LoginUserInput = {
  email: string
  password: string
}

type LoginUserOutput = {
  token: string
  user: SafeUser
}

export async function loginUser({
  email,
  password,
}: LoginUserInput): Promise<LoginUserOutput> {
  const normalizedEmail = email.trim().toLowerCase()

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })
  if (!user) {
    throw new Error('Credenciais inválidas!')
  }

  const ok = await comparePassword(password, user.password)
  if (!ok) {
    throw new Error('Credenciais inválidas!')
  }

  const token = signJwt({ id: user.id, email: user.email })
  const { password: _, ...safeUser } = user

  return { token, user: safeUser }
}
