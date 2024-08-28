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

export async function generateResponse() {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          "You are a meal planner. Given a list of ingredients in the user's fridge and the number and types of meals they need, generate meal suggestions. Please ensure that all quantities are provided in metric units (grams, liters, milliliters). Respond with only the generated meal plans in the specified JSON format.",
      },
      {
        role: 'user',
        content:
          'const fridgeContent = [ { ingredient: "eggs", quantity: 6 }, { ingredient: "flour", quantity: 300 } ]; const mealPreferences = [ { type: "lunch", number: 2 }, { type: "dinner", number: 4 } ]',
      },
    ],
    response_format: zodResponseFormat(MealPlanSchema, 'meal_plans'),
  })

  const mealPlans = completion.choices[0].message

  if (mealPlans.refusal) {
    return mealPlans.refusal
  }

  return mealPlans.content
}
