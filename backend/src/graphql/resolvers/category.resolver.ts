import type { Category, User } from '@prisma/client'
import { Arg, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql'

import { createCategory } from '@/app/categories/create-category'
import { listCategories } from '@/app/categories/list-categories'
import { GqlUser } from '@/graphql/decorators/gql-user.decorator'
import { CreateCategoryInput } from '@/graphql/inputs/category.input'
import { IsAuth } from '@/graphql/middlewares/is-auth.middleware'
import { CategoryModel } from '@/graphql/models/category.model'

@Resolver(() => CategoryModel)
@UseMiddleware(IsAuth)
export class CategoryResolver {
  @Mutation(() => CategoryModel)
  async createCategory(
    @Arg('data', () => CreateCategoryInput) data: CreateCategoryInput,
    @GqlUser() user: User,
  ): Promise<Category> {
    return createCategory(data, user.id)
  }

  @Query(() => [CategoryModel])
  async listCategories(@GqlUser() user: User): Promise<Category[]> {
    return listCategories(user.id)
  }
}
