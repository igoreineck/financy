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

@InputType()
export class UpdateTransactionInput {
  @Field(() => String, { nullable: true })
  description?: string | null

  @Field(() => Int, { nullable: true })
  amount?: number | null

  @Field(() => TransactionType, { nullable: true })
  type?: TransactionType | null

  @Field(() => Date, { nullable: true })
  occurredAt?: Date | null

  @Field(() => ID, { nullable: true })
  categoryId?: string | null
}
