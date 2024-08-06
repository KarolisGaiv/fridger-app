import { createTestDatabase } from '@tests/utils/database'
import { authContext } from '@tests/utils/context'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables } from '@tests/utils/records'
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

beforeEach(async () => {
  await clearTables(db, ['groceryList', 'mealPlan', 'user'])
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  ;[mealPlan] = await insertAll(db, 'mealPlan', [
    fakeMealPlan({ userId: user.id }),
  ])
  ;[ingredient] = await insertAll(db, 'ingredient', fakeIngredient())
})

describe('findById', () => {
  it('should retrieve a grocery list by ID', async () => {
    // arrange
    const fakeGroceryList = await createFakeGroceryList()
    const { findById } = createCaller(authContext({ db }, user))

    // act
    const result = await findById({ id: fakeGroceryList.id })

    // assert
    expect(result).toEqual(
      expect.objectContaining({
        id: fakeGroceryList.id,
        mealPlanId: fakeGroceryList.mealPlanId,
        product: fakeGroceryList.product,
        quantity: fakeGroceryList.quantity,
      })
    )
  })

  it('should throw an error if the grocery list item is not found', async () => {
    const nonExistentId = 999 // Assuming 999 does not exist in your test data
    const { findById } = createCaller(authContext({ db }, user))

    await expect(findById({ id: nonExistentId })).rejects.toThrow(
      /list not found/i
    )
  })

  it('prevents unauth user from using method', async () => {
    // arrange
    const { findById } = createCaller({
      db,
      req: {
        // no Auth header
        header: () => undefined,
      } as any,
    })

    // act & assert
    await expect(findById({ id: 289 })).rejects.toThrowError(/unauthenticated/i)
  })
})
