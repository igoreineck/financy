import { Field, ID, InputType, Int } from 'type-graphql'

import { TransactionType } from '@/graphql/models/transaction-type.enum'

@InputType()
export class CreateTransactionInput {
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
}
