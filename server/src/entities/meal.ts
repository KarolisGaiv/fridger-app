import { z } from 'zod'
import type { Selectable } from 'kysely'
import type { Meal } from '@server/database/types'
import { idSchema } from './shared'

export const mealSchema = z.object({
  id: idSchema,
  calories: z.number(),
  name: z.string().min(1).max(60),
  user: z.number(),
  mealPlan: z.number().optional(),
  assignedDay: z.number().min(1).max(7).optional(),
  type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
})

export const mealKeysAll = Object.keys(mealSchema.shape) as (keyof Meal)[]

export const mealKeysPublic = ['name', 'calories', 'type'] as const

export type MealPublic = Pick<Selectable<Meal>, (typeof mealKeysPublic)[number]>
