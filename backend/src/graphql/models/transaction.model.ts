import { Field, ID, Int, ObjectType } from 'type-graphql'

import { TransactionType } from './transaction-type.enum'

@ObjectType()
export class TransactionModel {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  description!: string

  @Field(() => Int)
  amount!: number

  @Field(() => TransactionType)
  type!: TransactionType

  @Field(() => Date)
  occurredAt!: Date

  @Field(() => ID)
  categoryId!: string

  @Field(() => Date)
  createdAt!: Date

  @Field(() => Date)
  updatedAt!: Date
}
