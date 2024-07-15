import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import { mealIngredientRepository } from '@server/repositories/mealIngredientRepository'
import { mealIngredientSchema } from '@server/entities/mealIngredient'

export default publicProcedure
  .use(
    provideRepos({
      mealIngredientRepository,
    })
  )
  .input(mealIngredientSchema.pick({ mealId: true }))
  .mutation(async ({ input: { mealId }, ctx: { repos } }) => {
    await repos.mealIngredientRepository.deleteIngredientsByMealId(mealId)
  })
