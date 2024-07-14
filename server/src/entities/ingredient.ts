import { z } from 'zod'
import type { Selectable } from 'kysely'
import type { Ingredient } from '@server/database/types'
import { idSchema } from './shared'

export const ingredientSchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(60),
})

export const ingredientKeys = Object.keys(
  ingredientSchema.shape
) as (keyof Ingredient)[]

export const ingredientKeyPublic = ['name'] as const

export type IngredientPublic = Pick<
  Selectable<Ingredient>,
  (typeof ingredientKeyPublic)[number]
>
