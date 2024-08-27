import { createTestDatabase } from '@tests/utils/database'
import { authContext } from '@tests/utils/context'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import {
  fakeUser,
  fakeMealPlan,
  fakeIngredient,
} from '@server/entities/tests/fakes'
import groceryListRouter from '..'

let user: any
let mealPlan: any
let ingredient: any

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(groceryListRouter)

async function createFakeGroceryList() {
  const list = {
    mealPlanId: mealPlan.id,
    product: 'snake oil',
    quantity: 30,
    ingredientId: ingredient.id,
  }
  const [data] = await insertAll(db, 'groceryList', [list])
  return { id: data.id, ...list }
}

beforeAll(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  ;[mealPlan] = await insertAll(db, 'mealPlan', [
    fakeMealPlan({ userId: user.id }),
  ])
  ;[ingredient] = await insertAll(db, 'ingredient', {
    ...fakeIngredient(),
    user: user.id,
  })
})

describe('findById', () => {
  it('should retrieve a grocery list by meal plan name', async () => {
    // arrange
    const fakeGroceryList = await createFakeGroceryList()
    const { findByMealPlanName } = createCaller(authContext({ db }, user))

    // act
    const result = await findByMealPlanName({ planName: mealPlan.planName })

    // assert
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: fakeGroceryList.id,
          mealPlanId: fakeGroceryList.mealPlanId,
          product: fakeGroceryList.product,
          quantity: fakeGroceryList.quantity,
        }),
      ])
    )
  })

  it('should throw an error if the grocery list item is not found', async () => {
    const { findByMealPlanName } = createCaller(authContext({ db }, user))

    await expect(
      findByMealPlanName({ planName: 'planDoesNotExist' })
    ).rejects.toThrow(/do not have active meal plan/i)
  })

  it('prevents unauth user from using method', async () => {
    // arrange
    const { findByMealPlanName } = createCaller({
      db,
      req: {
        // no Auth header
        header: () => undefined,
      } as any,
    })

    // act & assert
    await expect(findByMealPlanName({ planName: 'test' })).rejects.toThrowError(
      /unauthenticated/i
    )
  })
})
