import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { ingredientRepository } from '@server/repositories/ingredientRepository'
import { assertError } from '@server/utils/errors'
import { ingredientSchema } from '@server/entities/ingredient'

export default authenticatedProcedure
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
  .mutation(async ({ input: ingredient, ctx: { authUser, repos } }) => {
    const data = {
      ...ingredient,
      user: authUser.id,
    }

    const ingredientCreated = await repos.ingredientRepository
      .create(data)
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
