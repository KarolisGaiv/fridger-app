import { z } from 'zod'
import type { Selectable } from 'kysely'
import type { Meal } from '@server/database/types'
import { idSchema } from './shared'

export const mealSchema = z.object({
  id: idSchema,
  calories: z.number(),
  name: z.string().min(1).max(60),
})

export const mealKeysAll = Object.keys(mealSchema.shape) as (keyof Meal)[]

export const mealKeysPublic = ['name', 'calories'] as const

export type MealPublic = Pick<Selectable<Meal>, (typeof mealKeysPublic)[number]>
