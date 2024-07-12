import type { Database } from '@server/database'
import type { User } from '@server/database/types'
import {
  type UserPublic,
  userKeysAll,
  userKeysPublic,
} from '@server/entities/user'
import type { Insertable, Selectable } from 'kysely'

export function userRepository(db: Database) {
  return {
    async create(user: Insertable<User>): Promise<UserPublic> {
      return db
        .insertInto('user')
        .values(user)
        .returning(userKeysPublic)
        .executeTakeFirstOrThrow()
    },

    async findByEmail(email: string): Promise<Selectable<User> | undefined> {
      const user = await db
        .selectFrom('user')
        .select(userKeysAll)
        .where('email', '=', email)
        .executeTakeFirst()

      return user
    },
  }
}

/**
 * Represents the type of an object returned by the userRepository function.
 * This type includes methods like 'create' to interact with user data.
 * @typedef {Object} UserRepository
 * @property {Function} create - Method to add a new user to the database.
 * @returns {Promise<UserPublic>} A promise that, when resolved, gives back a user's information.
 */
export type UserRepository = ReturnType<typeof userRepository>
