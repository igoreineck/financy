import type { Category, User } from '@prisma/client'
import { Arg, ID, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql'

import { createCategory } from '@/app/categories/create-category'
import { deleteCategory } from '@/app/categories/delete-category'
import { getCategory } from '@/app/categories/get-category'
import { listCategories } from '@/app/categories/list-categories'
import { updateCategory } from '@/app/categories/update-category'
import { GqlUser } from '@/graphql/decorators/gql-user.decorator'
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/graphql/inputs/category.input'
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

  @Query(() => CategoryModel)
  async category(
    @Arg('id', () => ID) id: string,
    @GqlUser() user: User,
  ): Promise<Category> {
    return getCategory(id, user.id)
  }

  @Mutation(() => CategoryModel)
  async updateCategory(
    @Arg('id', () => ID) id: string,
    @Arg('data', () => UpdateCategoryInput) data: UpdateCategoryInput,
    @GqlUser() user: User,
  ): Promise<Category> {
    return updateCategory(id, data, user.id)
  }

  @Mutation(() => Boolean)
  async deleteCategory(
    @Arg('id', () => ID) id: string,
    @GqlUser() user: User,
  ): Promise<boolean> {
    return deleteCategory(id, user.id)
  }
}
