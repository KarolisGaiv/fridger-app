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
