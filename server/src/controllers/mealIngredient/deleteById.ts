import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { mealIngredientRepository } from '@server/repositories/mealIngredientRepository'
import { mealIngredientSchema } from '@server/entities/mealIngredient'

export default authenticatedProcedure
  .use(
    provideRepos({
      mealIngredientRepository,
    })
  )
  .input(mealIngredientSchema.pick({ id: true }))
  .mutation(async ({ input: { id }, ctx: { repos } }) => {
    await repos.mealIngredientRepository.deleteMealIngredient(id)
  })
