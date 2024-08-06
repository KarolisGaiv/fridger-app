import type {
  Meal,
  User,
  Ingredient,
  MealIngredient,
  MealPlan,
} from '@server/database/types'
import type { Insertable } from 'kysely'
import { random } from '@tests/utils/random'
import type { AuthUser } from '../user'

const randomId = () =>
  random.integer({
    min: 1,
    max: 1000000,
  })

/**
 * Generates a fake user with some default test data.
 * @param overrides Any properties that should be different from default fake data.
 */
export const fakeUser = <T extends Partial<Insertable<User>>>(
  overrides: T = {} as T
) =>
  ({
    email: random.email(),
    firstName: random.first(),
    lastName: random.last(),
    password: 'Password.123!',
    ...overrides,
  }) satisfies Insertable<User>

export const fakeAuthUser = <T extends Partial<AuthUser>>(
  overrides: T = {} as T
): AuthUser => ({
  id: randomId(),
  email: random.email(),
  ...overrides,
})

export const fakeMeal = <T extends Partial<Insertable<Meal>>>(
  overrides: T = {} as T
) =>
  ({
    calories: randomId(),
    name: random.string(),
    ...overrides,
  }) satisfies Insertable<Meal>

export const fakeIngredient = <T extends Partial<Insertable<Ingredient>>>(
  overrides: T = {} as T
) =>
  ({
    name: random.string(),
    ...overrides,
  }) satisfies Insertable<Ingredient>

export const fakeMealIngredient = <
  T extends Partial<Insertable<MealIngredient>>,
>(
  overrides: T = {} as T
) =>
  ({
    ingredientId: randomId(),
    mealId: randomId(),
    quantity: randomId(),
    ...overrides,
  }) satisfies Insertable<MealIngredient>

export const fakeMealPlan = <T extends Partial<Insertable<MealPlan>>>(
  overrides: T = {} as T
) =>
  ({
    planName: random.string(),
    userId: randomId(),
    ...overrides,
  }) satisfies Insertable<MealPlan>
