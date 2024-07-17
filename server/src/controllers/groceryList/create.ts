import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { assertError } from '@server/utils/errors'
import { groceryListRepository } from '@server/repositories/groceryListRepository'
import { groceryListSchema } from '@server/entities/groceryList'

export default authenticatedProcedure
  .use(
    provideRepos({
      groceryListRepository,
    })
  )
  .input(
    groceryListSchema.omit({
      id: true,
    })
  )
  .mutation(async ({ input, ctx: { repos } }) => {
    const result = await repos.groceryListRepository
      .create(input)
      .catch((error: unknown) => {
        assertError(error)

        if (error.message.includes('duplicate key')) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Grocery list already exist',
            cause: error,
          })
        }
        throw error
      })
    return { result }
  })
