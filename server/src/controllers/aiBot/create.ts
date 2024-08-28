import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { fridgeContentRepository } from '@server/repositories/fridgeContentRepository'
import { generateAIResponse } from '@server/services/aiBot'

function formatInput(fridgeContent) {
  return fridgeContent.map((item) => ({
    ingredient: item.name,
    quantity: item.existingQuantity,
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
    console.log(aiResponse.meals)
    console.log(aiResponse.meals[0].ingredients)

    // 4. format received response
  })
