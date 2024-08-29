import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { mealRepository } from '@server/repositories/mealRepository'
import { mealPlanRepository } from '@server/repositories/mealPlanRepository'
import { assertError } from '@server/utils/errors'
import { generatedMealDataSchema } from '@server/entities/aiBot'
import { ingredientRepository } from '@server/repositories/ingredientRepository'

import { mealIngredientRepository } from '@server/repositories/mealIngredientRepository'

export default authenticatedProcedure
  .use(
    provideRepos({
      mealRepository,
      mealPlanRepository,
      mealIngredientRepository,
      ingredientRepository,
    })
  )
  .input(generatedMealDataSchema)
  .mutation(async ({ input, ctx: { authUser, repos } }) => {
    console.log(input)
    const mealPlanId = await repos.mealPlanRepository.findByPlanName(
      input.mealPlan,
      authUser.id
    )

    const ingredientsToCreate = input.ingredients.map((i) => ({
      name: i.ingredient,
      user: authUser.id,
    }))

    // create new meal in meal table
    await repos.mealRepository.create({
      name: input.name,
      calories: input.calories,
      user: authUser.id,
    })

    // create meal ingredients in ingredients table
    await repos.ingredientRepository.createMultipleIngredients(
      ingredientsToCreate
    )
  })
