import { z } from 'zod'
import type { Selectable } from 'kysely'
import type { MealPlan } from '@server/database/types'
import { idSchema } from './shared'

export const mealPlanSchema = z.object({
  id: idSchema,
  planName: z.string().min(1).max(60),
  userId: idSchema,
})

export const mealPlanKeysAll = Object.keys(
  mealPlanSchema.shape
) as (keyof MealPlan)[]

export const mealPlanKeysPublic = ['planName', 'userId'] as const

export type MealPlanPublic = Pick<
  Selectable<MealPlan>,
  (typeof mealPlanKeysPublic)[number]
>
