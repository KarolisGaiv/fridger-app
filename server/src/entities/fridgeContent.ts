import { z } from 'zod'
import type { Selectable } from 'kysely'
import type { FridgeContent } from '@server/database/types'
import { idSchema } from './shared'

export const fridgeContentSchema = z.object({
  id: idSchema,
  userId: idSchema,
  groceryListId: idSchema,
  ingredientId: idSchema,
  mealPlan: idSchema,
  existingQuantity: z.number(),
})

export const fridgeContentKeysAll = Object.keys(
  fridgeContentSchema.shape
) as (keyof FridgeContent)[]

export const fridgeContentKeysPublic = [
  'ingredientId',
  'existingQuantity',
] as const

export type FridgeContentPublic = Pick<
  Selectable<FridgeContent>,
  (typeof fridgeContentKeysPublic)[number]
>
