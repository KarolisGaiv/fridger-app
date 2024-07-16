import { z } from 'zod'
import type { Selectable } from 'kysely'
import type { FridgeContent } from '@server/database/types'
import { idSchema } from './shared'

export const fridgeContentSchema = z.object({
  id: idSchema,
  userId: idSchema,
  groceryListId: idSchema,
  existingQuantity: z.number(),
})
