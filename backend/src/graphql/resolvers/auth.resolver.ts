import type { User } from '@prisma/client'
import { Arg, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql'

import { loginUser } from '@/app/auth/login-user'
import { registerUser } from '@/app/auth/register-user'
import { GqlUser } from '@/graphql/decorators/gql-user.decorator'
import { LoginInput, RegisterInput } from '@/graphql/inputs/auth.input'
import { IsAuth } from '@/graphql/middlewares/is-auth.middleware'
import { UserModel } from '@/graphql/models/user.model'
import { AuthOutput } from '@/graphql/outputs/auth.output'

@Resolver()
export class AuthResolver {
  @Mutation(() => AuthOutput)
  async register(
    @Arg('data', () => RegisterInput) data: RegisterInput,
  ): Promise<AuthOutput> {
    return registerUser(data)
  }

  @Mutation(() => AuthOutput)
  async login(
    @Arg('data', () => LoginInput) data: LoginInput,
  ): Promise<AuthOutput> {
    return loginUser(data)
  }

  @Query(() => UserModel)
  @UseMiddleware(IsAuth)
  async me(@GqlUser() user: User): Promise<User> {
    return user
  }
}
