import 'reflect-metadata'

import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import cors from 'cors'
import express from 'express'
import { buildSchema } from 'type-graphql'

import { env } from '@/env'
import { type GraphqlContext, buildContext } from '@/graphql/context'
import { AuthResolver } from '@/graphql/resolvers/auth.resolver'

async function bootstrap() {
  const app = express()

  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  )

  const schema = await buildSchema({
    resolvers: [AuthResolver],
    validate: false,
    emitSchemaFile: './schema.graphql',
  })

  const server = new ApolloServer<GraphqlContext>({ schema })
  await server.start()

  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => buildContext({ req, res }),
    }),
  )

  app.listen({ port: env.PORT }, () => {
    console.log(`Servidor iniciado na porta ${env.PORT}!`)
  })
}

bootstrap()
