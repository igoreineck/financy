import { Field, ID, ObjectType } from 'type-graphql'

@ObjectType()
export class CategoryModel {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  name!: string

  @Field(() => String)
  color!: string

  @Field(() => String)
  icon!: string

  @Field(() => String, { nullable: true })
  description!: string | null

  @Field(() => Date)
  createdAt!: Date

  @Field(() => Date)
  updatedAt!: Date
}
