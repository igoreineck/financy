import { Field, InputType } from 'type-graphql'

@InputType()
export class CreateCategoryInput {
  @Field(() => String)
  name!: string

  @Field(() => String)
  color!: string

  @Field(() => String)
  icon!: string

  @Field(() => String, { nullable: true })
  description?: string | null
}
