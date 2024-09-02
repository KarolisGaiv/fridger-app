import type { User } from '@server/shared/types'
import type { Insertable } from 'kysely'
import { Chance } from 'chance'

export const random = process.env.CI ? Chance(1) : Chance()

/**
 * Creates a new user with a random email and password. We want a random email
 * as our E2E tests can run against a real database, and we don't want to
 * our tests to fail because of a duplicate email.
 */
export const fakeUser = <T extends Insertable<User>>(overrides: Partial<T> = {} as T) => ({
  email: random.email(),
  password: 'password.123',
  firstName: random.first(),
  lastName: random.last(),
  ...overrides,
})
