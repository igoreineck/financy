import type { Category, Transaction, User } from '@prisma/client'
import {
  Arg,
  FieldResolver,
  ID,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql'

import { createTransaction } from '@/app/transactions/create-transaction'
import { deleteTransaction } from '@/app/transactions/delete-transaction'
import { getTransaction } from '@/app/transactions/get-transaction'
import { listTransactions } from '@/app/transactions/list-transactions'
import { updateTransaction } from '@/app/transactions/update-transaction'
import { GqlUser } from '@/graphql/decorators/gql-user.decorator'
import {
  CreateTransactionInput,
  UpdateTransactionInput,
} from '@/graphql/inputs/transaction.input'
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

  @Query(() => TransactionModel)
  async transaction(
    @Arg('id', () => ID) id: string,
    @GqlUser() user: User,
  ): Promise<Transaction> {
    return getTransaction(id, user.id)
  }

  @Mutation(() => TransactionModel)
  async updateTransaction(
    @Arg('id', () => ID) id: string,
    @Arg('data', () => UpdateTransactionInput) data: UpdateTransactionInput,
    @GqlUser() user: User,
  ): Promise<Transaction> {
    return updateTransaction(id, data, user.id)
  }

  @Mutation(() => Boolean)
  async deleteTransaction(
    @Arg('id', () => ID) id: string,
    @GqlUser() user: User,
  ): Promise<boolean> {
    return deleteTransaction(id, user.id)
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
