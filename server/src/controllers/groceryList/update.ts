import { publicProcedure } from '@server/trpc'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { groceryListRepository } from '@server/repositories/groceryListRepository'
import { groceryListSchema } from '@server/entities/groceryList'
import { z } from 'zod'

export default publicProcedure
  .use(
    provideRepos({
      groceryListRepository,
    })
  )
  .input(
    z.object({
      groceryListId: z.number(),
      updateInfo: groceryListSchema.partial(),
    })
  )
  .mutation(async ({ input, ctx: { repos } }) => {
    const updatedGroceryList = await repos.groceryListRepository.update(
      input.groceryListId,
      input.updateInfo
    )

    if (!updatedGroceryList) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Grocery list not found',
      })
    }

    return updatedGroceryList
  })
