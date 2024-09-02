import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { mealRepository } from '@server/repositories/mealRepository'
import { mealPlanRepository } from '@server/repositories/mealPlanRepository'
import { generatedMealDataSchema } from '@server/entities/aiBot'
import { mealPlanScheduleRepository } from '@server/repositories/mealPlanScheduleRepository'
import { ingredientRepository } from '@server/repositories/ingredientRepository'
import { mealIngredientRepository } from '@server/repositories/mealIngredientRepository'

export default authenticatedProcedure
  .use(
    provideRepos({
      mealRepository,
      mealPlanRepository,
      mealIngredientRepository,
      ingredientRepository,
      mealPlanScheduleRepository,
    })
  )
  .input(generatedMealDataSchema)
  .mutation(async ({ input, ctx: { authUser, repos } }) => {
    // format the ingredients to be created
    const ingredientsToCreate = input.ingredients.map((i) => ({
      name: i.ingredient,
      user: authUser.id,
    }))

    // Create a new meal in the meal table
    const createdMeal = await repos.mealRepository.create({
      name: input.name,
      calories: input.calories,
      user: authUser.id,
    })

    // Create new meal ingredients in the ingredients table
    const createdIngredients =
      await repos.ingredientRepository.createMultipleIngredients(
        ingredientsToCreate
      )

    // format meal ingredient records to be inserted into the mealIngredient table
    const mealIngredients = input.ingredients.map((ingredient, index) => ({
      ingredientId: createdIngredients[index].id,
      quantity: ingredient.quantity,
      mealId: createdMeal.id,
    }))

    // Insert meal ingredient records into the mealIngredient table
    await repos.mealIngredientRepository.createMultipleMealIngredients(
      mealIngredients
    )

    //  insert new record into the meal plan schedule table
    const day = parseInt(input.assignedDay, 10)
    await repos.mealPlanScheduleRepository.create(
      input.name,
      input.mealPlan,
      day,
      input.type,
      authUser.id
    )
  })
