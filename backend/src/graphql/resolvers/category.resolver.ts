import type { Category } from '@prisma/client'
import { Arg, ID, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql'

import { createCategory } from '@/app/categories/create-category'
import { deleteCategory } from '@/app/categories/delete-category'
import { getCategory } from '@/app/categories/get-category'
import { listCategories } from '@/app/categories/list-categories'
import { updateCategory } from '@/app/categories/update-category'
import { GqlUserId } from '@/graphql/decorators/gql-user-id.decorator'
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
    @GqlUserId() userId: string,
  ): Promise<Category> {
    return createCategory(data, userId)
  }

  @Query(() => [CategoryModel])
  async listCategories(@GqlUserId() userId: string): Promise<Category[]> {
    return listCategories(userId)
  }

  @Query(() => CategoryModel)
  async category(
    @Arg('id', () => ID) id: string,
    @GqlUserId() userId: string,
  ): Promise<Category> {
    return getCategory(id, userId)
  }

  @Mutation(() => CategoryModel)
  async updateCategory(
    @Arg('id', () => ID) id: string,
    @Arg('data', () => UpdateCategoryInput) data: UpdateCategoryInput,
    @GqlUserId() userId: string,
  ): Promise<Category> {
    return updateCategory(id, data, userId)
  }

  @Mutation(() => Boolean)
  async deleteCategory(
    @Arg('id', () => ID) id: string,
    @GqlUserId() userId: string,
  ): Promise<boolean> {
    return deleteCategory(id, userId)
  }
}
