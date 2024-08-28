import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { fridgeContentRepository } from '@server/repositories/fridgeContentRepository'
import { generateAIResponse } from '@server/services/aiBot'

function formatInput(fridgeContent: any[]) {
  return fridgeContent.map((item) => ({
    ingredient: item.name,
    quantity: item.existingQuantity,
  }))
}

function formatIngredients(ingredients: any[]) {
  return ingredients.map((ingredient) => ({
    ingredient: ingredient.ingredient,
    quantity: ingredient.quantity,
    unit: ingredient.unit,
  }))
}

export default authenticatedProcedure
  .use(
    provideRepos({
      fridgeContentRepository,
    })
  )
  .query(async ({ ctx: { authUser, repos } }) => {
    // 1. collect available ingredients from fridge
    const availableIngredients = await repos.fridgeContentRepository.findByUser(
      authUser.id
    )

    // 2. format ingredients into the form
    const formattedFridgeContent = formatInput(availableIngredients)

    // 3. get information what type and how many of meals should be created in a format cosnt mealPreferences = [{type: ...., number: ....}, ...]
    const testPreferences = [{ type: 'lunch', number: 3 }]

    // 4. use chatGPt to get response
    const aiResponse = await generateAIResponse(
      formattedFridgeContent,
      testPreferences
    )

    // 5. format received response
    const formattedMeals = aiResponse.meals.map(
      (meal: {
        type: string
        name: string
        calories: number
        ingredients: any[]
      }) => ({
        type: meal.type,
        name: meal.name,
        calories: meal.calories,
        ingredients: formatIngredients(meal.ingredients),
      })
    )

    // 4.
    return {
      meals: formattedMeals,
    }
  })
