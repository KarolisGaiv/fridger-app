import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { groceryListRepository } from '@server/repositories/groceryListRepository'
import { groceryListSchema } from '@server/entities/groceryList'

export default authenticatedProcedure
  .use(
    provideRepos({
      groceryListRepository,
    })
  )
  .input(groceryListSchema.pick({ id: true }))
  .query(async ({ input, ctx: { repos } }) => {
    const result = await repos.groceryListRepository.findById(input.id)

    if (!result) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Grocery list not found',
      })
    }
    return result
  })
