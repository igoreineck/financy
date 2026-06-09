import type { Category, Transaction, User } from '@prisma/client'
import {
  Arg,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql'

import { createTransaction } from '@/app/transactions/create-transaction'
import { listTransactions } from '@/app/transactions/list-transactions'
import { GqlUser } from '@/graphql/decorators/gql-user.decorator'
import { CreateTransactionInput } from '@/graphql/inputs/transaction.input'
import { IsAuth } from '@/graphql/middlewares/is-auth.middleware'
import { CategoryModel } from '@/graphql/models/category.model'
import { TransactionModel } from '@/graphql/models/transaction.model'
import { prisma } from '@/infra/db/prisma'

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

  @Query(() => [TransactionModel])
  async listTransactions(@GqlUser() user: User): Promise<Transaction[]> {
    return listTransactions(user.id)
  }

  @FieldResolver(() => CategoryModel)
  async category(@Root() transaction: Transaction): Promise<Category> {
    const category = await prisma.category.findUnique({
      where: { id: transaction.categoryId },
    })
    if (!category) throw new Error('Categoria não encontrada')
    return category
  }
}
