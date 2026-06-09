import 'reflect-metadata'

import { buildSchema } from 'type-graphql'

import { AuthResolver } from '@/graphql/resolvers/auth.resolver'
import { CategoryResolver } from '@/graphql/resolvers/category.resolver'
import { TransactionResolver } from '@/graphql/resolvers/transaction.resolver'

async function main() {
  await buildSchema({
    resolvers: [AuthResolver, CategoryResolver, TransactionResolver],
    validate: false,
    emitSchemaFile: './schema.graphql',
  })
  console.log('Schema exported to ./schema.graphql')
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
