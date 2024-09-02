import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { fridgeContentRepository } from '@server/repositories/fridgeContentRepository'
import { mealRepository } from '@server/repositories/mealRepository'
import { mealIngredientRepository } from '@server/repositories/mealIngredientRepository'
import { z } from 'zod'

export default authenticatedProcedure
  .use(
    provideRepos({
      fridgeContentRepository,
      mealRepository,
      mealIngredientRepository,
    })
  )
  .input(
    z.object({
      mealName: z.string(),
      completed: z.boolean(),
    })
  )
  .mutation(async ({ input, ctx: { authUser, repos } }) => {
    const { mealName, completed } = input

    // 1. Find all ingredients related to the meal
    const meal = await repos.mealRepository.findByName(mealName, authUser.id)
    if (!meal) {
      throw new Error(`Meal with name ${mealName} not found.`)
    }

    // 2. get ingredients related to the meal
    const ingredients =
      await repos.mealIngredientRepository.findIngredientsByMealId(meal.id)

    // 3. Determine quantity change based on completed status
    const quantityChange = completed
      ? (ingredient: { quantity: number }) => -ingredient.quantity
      : (ingredient: { quantity: number }) => ingredient.quantity

    // 4. Update fridge content based on meal completed status
    const updatePromises = ingredients.map((ingredient) =>
      repos.fridgeContentRepository.updateQuantity(
        authUser.id,
        ingredient.ingredientId,
        quantityChange(ingredient)
      )
    )

    // 4. Wait for all the promises to complete
    await Promise.all(updatePromises)
  })
