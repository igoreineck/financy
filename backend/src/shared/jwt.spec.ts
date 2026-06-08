import jsonwebtoken from 'jsonwebtoken'
import { describe, expect, it } from 'vitest'

const { sign } = jsonwebtoken

import { env } from '@/env'
import { signJwt, verifyJwt } from './jwt'

describe('jwt', () => {
  it('signJwt + verifyJwt roundtrip preserva payload', () => {
    const payload = { id: 'user-123', email: 'alice@example.com' }
    const token = signJwt(payload)
    const decoded = verifyJwt(token)
    expect(decoded).toEqual(payload)
  })

  it('verifyJwt rejeita token expirado', () => {
    const expired = sign(
      { id: 'user-123', email: 'alice@example.com' },
      env.JWT_SECRET,
      { expiresIn: -1 },
    )
    expect(() => verifyJwt(expired)).toThrow()
  })
})
