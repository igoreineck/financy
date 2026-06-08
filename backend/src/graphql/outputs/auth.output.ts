import { Field, ObjectType } from 'type-graphql'

import { UserModel } from '@/graphql/models/user.model'

@ObjectType()
export class AuthOutput {
  @Field(() => String)
  token!: string

  @Field(() => UserModel)
  user!: UserModel
}
