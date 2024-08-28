import { OpenAI } from 'openai'
import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Define the schema for meal plans
const MealPlanSchema = z.object({
  meals: z.array(
    z.object({
      type: z.string(),
      name: z.string(),
      calories: z.number(),
      ingredients: z.array(
        z.object({
          ingredient: z.string(),
          quantity: z.number(),
          unit: z.string(),
        })
      ),
    })
  ),
})

export async function generateAIResponse(fridgeContent, preferences) {
  // Convert fridgeContent and preferences to strings
  const fridgeContentString = JSON.stringify(fridgeContent).replace(/"/g, '\\"')

  const preferencesString = JSON.stringify(preferences).replace(/"/g, '\\"')

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          "You are a meal planner. Given a list of ingredients in the user's fridge, generate meal suggestions that only use those ingredients. Ensure that all quantities are provided in metric units (grams, liters, milliliters). Respond with only the generated meal plans in the specified JSON format.",
      },
      {
        role: 'user',
        content: `Ingredients in my fridge: ${fridgeContentString}. I would like to have the following meals: ${preferencesString}. Suggest meals using only these ingredients.`,
      },
    ],
    response_format: zodResponseFormat(MealPlanSchema, 'meal_plans'),
  })

  const mealPlans = completion.choices[0].message

  if (mealPlans.refusal) {
    return mealPlans.refusal
  }

  // Parse the response content to JSON
  const jsonResponse = JSON.parse(mealPlans.content!)
  return jsonResponse
}
