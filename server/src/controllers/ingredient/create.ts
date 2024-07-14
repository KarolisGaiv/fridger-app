import { publicProcedure } from '@server/trpc'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { ingredientRepository } from '@server/repositories/ingredientRepository'
import { assertError } from '@server/utils/errors'
import { ingredientSchema } from '@server/entities/ingredient'

export default publicProcedure
  .use(
    provideRepos({
      ingredientRepository,
    })
  )
  .input(
    ingredientSchema.pick({
      name: true,
    })
  )
  .mutation(async ({ input: ingredient, ctx: { repos } }) => {
    const ingredientCreated = await repos.ingredientRepository
      .create(ingredient)
      .catch((error: unknown) => {
        assertError(error)

        if (error.message.includes('duplicate key')) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Meal already exist',
            cause: error,
          })
        }
        throw error
      })
    return { ingredientCreated }
  })
