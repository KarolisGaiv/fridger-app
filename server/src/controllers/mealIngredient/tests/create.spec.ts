import { authContext } from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, selectAll, clearTables } from '@tests/utils/records'
import {
  fakeMeal,
  fakeIngredient,
  fakeUser,
} from '@server/entities/tests/fakes'
import mealIngredientRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealIngredientRouter)
let user: any
let meal: any
let ingredient: any

beforeEach(async () => {
  await clearTables(db, ['meal', 'ingredient'])
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  ;[meal] = await insertAll(db, 'meal', [fakeMeal()])
  ;[ingredient] = await insertAll(db, 'ingredient', [fakeIngredient()])
})

describe('create', async () => {
  it.skip('should allow saving new meal ingredient', async () => {
    // arrange
    const mealIngredientData = {
      mealId: meal.id,
      ingredientId: ingredient.id,
      quantity: 200,
    }
    const { create } = createCaller(authContext({ db }, user))

    // act
    const result = await create(mealIngredientData)
    expect(result).toMatchObject(mealIngredientData)
    const mealIngredients = await selectAll(db, 'mealIngredient')
    expect(mealIngredients).toHaveLength(1)
    expect(mealIngredients[0]).toMatchObject(mealIngredientData)
  })

  it.skip('prevents unauth user from adding meal plan', async () => {
    // arrange
    const mealIngredientData = {
      mealId: meal.id,
      ingredientId: ingredient.id,
      quantity: 200,
    }
    const { create } = createCaller({
      db,
      req: {
        // no Auth header
        header: () => undefined,
      } as any,
    })

    // act & assert
    await expect(create(mealIngredientData)).rejects.toThrowError(
      /unauthenticated/i
    )
  })
})
