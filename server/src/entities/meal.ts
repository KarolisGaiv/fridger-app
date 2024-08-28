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
  completed: z.boolean().optional(),
})

export const newMealSchema = z.object({
  calories: z.number(),
  name: z.string().min(1).max(60),
  mealPlan: z.string().optional(),
  assignedDay: z.number().min(1).max(7).optional(),
  type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
})

export const mealKeysAll = Object.keys(mealSchema.shape) as (keyof Meal)[]

export const mealKeysPublic = [
  'name',
  'calories',
  'type',
  'assignedDay',
  'completed',
] as const

export type MealPublic = Pick<Selectable<Meal>, (typeof mealKeysPublic)[number]>

export const updateMealSchema = mealSchema.partial()
export type UpdateMealType = z.infer<typeof updateMealSchema>
