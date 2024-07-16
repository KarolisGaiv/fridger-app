import type { Database } from '@server/database'
import type { FridgeContent } from '@server/database/types'
import {
  type FridgeContentPublic,
  fridgeContentKeysPublic,
  fridgeContentKeysAll,
} from '@server/entities/fridgeContent'
import type { Insertable, Selectable } from 'kysely'

export function fridgeContentRepository(db: Database) {
  return {
    async create(
      fridgeContent: Insertable<FridgeContent>
    ): Promise<FridgeContentPublic> {
      return db
        .insertInto('fridgeContent')
        .values(fridgeContent)
        .returning(fridgeContentKeysPublic)
        .executeTakeFirstOrThrow()
    },
  }
}
