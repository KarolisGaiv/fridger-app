import { z } from 'zod'
import { idSchema } from './shared'

export const mealPlanScheduleSchema = z.object({
  mealName: z.string().min(1),
  mealPlan: z.string().min(1),
  userId: idSchema,
  assignedDay: z.number().min(1).max(7),
  type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
})
