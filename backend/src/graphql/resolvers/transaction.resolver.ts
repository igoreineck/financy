import { Arg, ID, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql'

import type { TransactionWithCategory } from '@/app/transactions/create-transaction'
import { createTransaction } from '@/app/transactions/create-transaction'
import { deleteTransaction } from '@/app/transactions/delete-transaction'
import { getTransaction } from '@/app/transactions/get-transaction'
import { listTransactions } from '@/app/transactions/list-transactions'
import { updateTransaction } from '@/app/transactions/update-transaction'
import { GqlUserId } from '@/graphql/decorators/gql-user-id.decorator'
import {
  CreateTransactionInput,
  UpdateTransactionInput,
} from '@/graphql/inputs/transaction.input'
import { IsAuth } from '@/graphql/middlewares/is-auth.middleware'
import { TransactionModel } from '@/graphql/models/transaction.model'

@Resolver(() => TransactionModel)
@UseMiddleware(IsAuth)
export class TransactionResolver {
  @Mutation(() => TransactionModel)
  async createTransaction(
    @Arg('data', () => CreateTransactionInput) data: CreateTransactionInput,
    @GqlUserId() userId: string,
  ): Promise<TransactionWithCategory> {
    return createTransaction(data, userId)
  }

  @Query(() => [TransactionModel])
  async listTransactions(
    @GqlUserId() userId: string,
  ): Promise<TransactionWithCategory[]> {
    return listTransactions(userId)
  }

  @Query(() => TransactionModel)
  async transaction(
    @Arg('id', () => ID) id: string,
    @GqlUserId() userId: string,
  ): Promise<TransactionWithCategory> {
    return getTransaction(id, userId)
  }

  @Mutation(() => TransactionModel)
  async updateTransaction(
    @Arg('id', () => ID) id: string,
    @Arg('data', () => UpdateTransactionInput) data: UpdateTransactionInput,
    @GqlUserId() userId: string,
  ): Promise<TransactionWithCategory> {
    return updateTransaction(id, data, userId)
  }

  @Mutation(() => Boolean)
  async deleteTransaction(
    @Arg('id', () => ID) id: string,
    @GqlUserId() userId: string,
  ): Promise<boolean> {
    return deleteTransaction(id, userId)
  }
}
