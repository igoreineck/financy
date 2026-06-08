import { execSync } from 'node:child_process'
import { afterAll, beforeAll, beforeEach } from 'vitest'

import { prisma } from '@/infra/db/prisma'

beforeAll(() => {
  execSync('prisma migrate deploy', {
    stdio: 'ignore',
    env: process.env,
  })
})

beforeEach(async () => {
  // Wipe user data between tests. Each tarefa that adds a Prisma model must
  // extend this block with the corresponding `prisma.<model>.deleteMany()`,
  // in dependency order (children before parents).
  // Currently no domain models exist — this is a no-op.
})

afterAll(async () => {
  await prisma.$disconnect()
})
