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

export async function generateAIMealBy(mealType: string, calories: number) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a meal planner. Generate a meal suggestion based on the specified meal type and calorie count. Ensure that the meal includes ingredients that are commonly used and that the total calories match the specified amount. Ensure that all quantities are provided in metric units (grams, liters, milliliters). Respond with only the generated meal in the specified JSON format.',
      },
      {
        role: 'user',
        content: `I want a meal of type "${mealType}" that has approximately ${calories}. Provide meal name, calorie count and a list of ingredients with their quantities and units`,
      },
    ],
    response_format: zodResponseFormat(MealPlanSchema, 'meal'),
  })

  const meal = completion.choices[0].message

  if (meal.refusal) {
    return meal.refusal
  }

  const jsonRes = JSON.parse(meal.content!)
  return jsonRes
}
