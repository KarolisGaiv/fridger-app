import { z } from 'zod'
import type { Selectable } from 'kysely'
import type { MealIngredient } from '@server/database/types'
import { idSchema } from './shared'

export const mealIngredientSchema = z.object({
  id: idSchema,
  ingredientId: idSchema,
  mealId: idSchema,
  quantity: z.number(),
  mealPlan: z.number(),
})

export const mealIngredientKeysAll = Object.keys(
  mealIngredientSchema.shape
) as (keyof MealIngredient)[]

export const mealIngredientKeysPublic = [
  'mealId',
  'ingredientId',
  'quantity',
] as const

export type MealIngredientPublic = Pick<
  Selectable<MealIngredient>,
  (typeof mealIngredientKeysPublic)[number]
>
