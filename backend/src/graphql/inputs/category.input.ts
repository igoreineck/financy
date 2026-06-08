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

@InputType()
export class UpdateCategoryInput {
  @Field(() => String, { nullable: true })
  name?: string | null

  @Field(() => String, { nullable: true })
  color?: string | null

  @Field(() => String, { nullable: true })
  icon?: string | null

  @Field(() => String, { nullable: true })
  description?: string | null
}
