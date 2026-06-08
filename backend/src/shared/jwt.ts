import jsonwebtoken, { type SignOptions } from 'jsonwebtoken'

import { env } from '@/env'

const { sign, verify } = jsonwebtoken

export type JwtPayload = {
  id: string
  email: string
}

export function signJwt(
  payload: JwtPayload,
  expiresIn: SignOptions['expiresIn'] = '1d',
): string {
  return sign(payload, env.JWT_SECRET, { expiresIn })
}

export function verifyJwt(token: string): JwtPayload {
  const decoded = verify(token, env.JWT_SECRET)
  if (typeof decoded === 'string') {
    throw new Error('Token inválido!')
  }
  const { id, email } = decoded as JwtPayload
  return { id, email }
}
