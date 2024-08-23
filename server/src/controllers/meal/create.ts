import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { mealRepository } from '@server/repositories/mealRepository'
import { mealPlanRepository } from '@server/repositories/mealPlanRepository'
import { assertError } from '@server/utils/errors'
import { newMealSchema } from '@server/entities/meal'

export default authenticatedProcedure
  .use(
    provideRepos({
      mealRepository,
      mealPlanRepository,
    })
  )
  .input(newMealSchema)
  .mutation(async ({ input, ctx: { authUser, repos } }) => {
    // Convert meal plan name to meal plan ID if provided
    const mealPlanId = input.mealPlan
      ? await repos.mealPlanRepository.findByPlanName(
          input.mealPlan,
          authUser.id
        )
      : null

    // Prepare the meal data
    const data = {
      ...input,
      user: authUser.id,
      mealPlan: mealPlanId ?? null,
      assignedDay: input.assignedDay ?? null,
      type: input.type ?? null,
    }

    const mealCreated = await repos.mealRepository
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
  })
