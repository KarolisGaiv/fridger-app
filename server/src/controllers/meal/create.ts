import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { mealRepository } from '@server/repositories/mealRepository'
import { assertError } from '@server/utils/errors'
import { mealSchema } from '@server/entities/meal'

export default authenticatedProcedure
  .use(
    provideRepos({
      mealRepository,
    })
  )
  .input(
    mealSchema.pick({
      name: true,
      calories: true,
    })
  )
  .mutation(
    async ({ input, ctx: { authUser, repos: databaseRepositories } }) => {
      const data = {
        ...input,
        user: authUser.id,
      }

      const mealCreated = await databaseRepositories.mealRepository
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
      return { mealCreated }
    }
  )
