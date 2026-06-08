import type { Request, Response } from 'express'

import { verifyJwt } from '@/shared/jwt'

export type GraphqlContext = {
  user: string | undefined
  token: string | undefined
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
  if (token) {
    try {
      user = verifyJwt(token).id
    } catch {
      user = undefined
    }
  }

  return { user, token, req, res }
}
