import type { Transaction, User } from '@prisma/client'
import { Arg, Mutation, Resolver, UseMiddleware } from 'type-graphql'

import { createTransaction } from '@/app/transactions/create-transaction'
import { GqlUser } from '@/graphql/decorators/gql-user.decorator'
import { CreateTransactionInput } from '@/graphql/inputs/transaction.input'
import { IsAuth } from '@/graphql/middlewares/is-auth.middleware'
import { TransactionModel } from '@/graphql/models/transaction.model'

@Resolver(() => TransactionModel)
@UseMiddleware(IsAuth)
export class TransactionResolver {
  @Mutation(() => TransactionModel)
  async createTransaction(
    @Arg('data', () => CreateTransactionInput) data: CreateTransactionInput,
    @GqlUser() user: User,
  ): Promise<Transaction> {
    return createTransaction(data, user.id)
  }
}
