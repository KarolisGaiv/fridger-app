import { z } from 'zod'

export const generatedMealDataSchema = z.object({
  mealPlan: z.string(),
  assignedDay: z.string(),
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
