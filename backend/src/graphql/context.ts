import type { Request, Response } from 'express'
import jsonwebtoken from 'jsonwebtoken'

import { verifyJwt } from '@/shared/jwt'

export type AuthErrorReason = 'expired' | 'invalid'

export type GraphqlContext = {
  user: string | undefined
  token: string | undefined
  authError: AuthErrorReason | undefined
  req: Request
  res: Response
}

type BuildContextArgs = {
  req: Request
  res: Response
}

export async function buildContext({
  req,
  res,
}: BuildContextArgs): Promise<GraphqlContext> {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined

  let user: string | undefined
  let authError: AuthErrorReason | undefined
  if (token) {
    try {
      user = verifyJwt(token).id
    } catch (err) {
      authError =
        err instanceof jsonwebtoken.TokenExpiredError ? 'expired' : 'invalid'
    }
  }

  return { user, token, authError, req, res }
}
