import { z } from 'zod'
import type { Selectable } from 'kysely'
import type { GroceryList } from '@server/database/types'
import { idSchema } from './shared'

export const groceryListSchema = z.object({
  id: idSchema,
  mealPlanId: z.number(),
  product: z.string(),
  quantity: z.number(),
  ingredientId: z.number(),
})

export const groceryListKeysAll = Object.keys(
  groceryListSchema.shape
) as (keyof GroceryList)[]

export const groceryListKeysPublic = [
  'mealPlanId',
  'product',
  'quantity',
  'ingredientId',
] as const

export type GroceryListPublic = Pick<
  Selectable<GroceryList>,
  (typeof groceryListKeysPublic)[number]
>
