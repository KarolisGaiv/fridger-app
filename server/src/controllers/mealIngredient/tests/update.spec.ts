import { authContext } from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
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

beforeEach(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  ;[meal] = await insertAll(db, 'meal', [fakeMeal()])
})

describe('updateMealIngredient', () => {
  it.skip('should update a meal ingredient successfully', async () => {
    const [ingredient1] = await insertAll(db, 'ingredient', [fakeIngredient()])

    const initialMealIngredient = {
      mealId: meal.id,
      ingredientId: ingredient1.id,
      quantity: 200,
    }

    const updatedInfo = {
      quantity: 300,
    }

    const [insertedMealIngredient] = await insertAll(db, 'mealIngredient', [
      initialMealIngredient,
    ])

    const { updateMealIngredient } = createCaller(authContext({ db }, user))
    const result = await updateMealIngredient({
      mealIngredientId: insertedMealIngredient.id,
      updateInfo: updatedInfo,
    })

    expect(result).toMatchObject({
      mealId: meal.id,
      ingredientId: ingredient1.id,
      quantity: updatedInfo.quantity,
    })
  })

  it.skip('should throw a NOT_FOUND error if the meal ingredient does not exist', async () => {
    const updatedInfo = {
      quantity: 300,
    }

    const { updateMealIngredient } = createCaller(authContext({ db }, user))
    await expect(
      updateMealIngredient({
        mealIngredientId: 999, // Assuming a non-existent ID
        updateInfo: updatedInfo,
      })
    ).rejects.toThrowError(/meal ingredient does not exist/i)
  })

  it.skip('prevents unauth user from using procedure', async () => {
    const { updateMealIngredient } = createCaller({
      db,
      req: {
        // no Auth header
        header: () => undefined,
      } as any,
    })

    await expect(
      updateMealIngredient({
        mealIngredientId: 2,
        updateInfo: { quantity: 300 },
      })
    ).rejects.toThrowError(/unauthenticated/i)
  })
})
