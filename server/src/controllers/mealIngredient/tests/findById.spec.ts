import { authContext } from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables } from '@tests/utils/records'
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

describe('findMealIngredientById', () => {
  it.skip("should find ingredient by it.skip's id", async () => {
    // arrange
    const mealIngredientData = {
      mealId: meal.id,
      ingredientId: ingredient.id,
      quantity: 200,
    }
    const [mealIngredient] = await insertAll(db, 'mealIngredient', [
      mealIngredientData,
    ])

    // act
    const { findById } = createCaller(authContext({ db }, user))
    const result = await findById({ id: mealIngredient.id })

    // assert
    expect(result).toMatchObject({
      mealId: mealIngredient.mealId,
      ingredientId: mealIngredient.ingredientId,
      quantity: mealIngredient.quantity,
    })
  })

  it.skip('should throw error if ingredient not found', async () => {
    const { findById } = createCaller(authContext({ db }, user))
    await expect(findById({ id: 489489498 })).rejects.toThrowError(
      /no results/i
    )
  })

  it.skip('prevents unauth user from using procedure', async () => {
    // arrange
    const { findById } = createCaller({
      db,
      req: {
        // no Auth header
        header: () => undefined,
      } as any,
    })

    // act & assert
    await expect(findById({ id: ingredient.id })).rejects.toThrowError(
      /unauthenticated/i
    )
  })
})
