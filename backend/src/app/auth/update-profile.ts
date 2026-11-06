import { prisma } from '@/infra/db/prisma'
import type { SafeUser } from './register-user'

type UpdateProfileInput = {
  userId: string
  name: string
}

export async function updateProfile({
  userId,
  name,
}: UpdateProfileInput): Promise<SafeUser> {
  const trimmed = name.trim()
  if (trimmed.length === 0) {
    throw new Error('Name is required!')
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: trimmed },
    omit: { password: true },
  })

  return user
}
