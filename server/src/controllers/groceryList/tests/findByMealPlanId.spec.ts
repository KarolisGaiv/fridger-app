import { createTestDatabase } from '@tests/utils/database'
import { authContext } from '@tests/utils/context'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables } from '@tests/utils/records'
import { fakeUser, fakeMealPlan } from '@server/entities/tests/fakes'
import groceryListRouter from '..'

let user: any
let mealPlan: any

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(groceryListRouter)

async function createFakeGroceryList() {
  const list = {
    mealPlanId: mealPlan.id,
    product: 'snake oil',
    quantity: 30,
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
})

describe('findById', () => {
  it('should retrieve a grocery list by meal plan ID', async () => {
    // arrange
    const fakeGroceryList = await createFakeGroceryList()
    const { findByMealPlanId } = createCaller(authContext({ db }, user))

    // act
    const result = await findByMealPlanId({ mealPlanId: mealPlan.id })

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
    const nonExistentId = 999 // Assuming 999 does not exist in your test data
    const { findByMealPlanId } = createCaller(authContext({ db }, user))

    await expect(
      findByMealPlanId({ mealPlanId: nonExistentId })
    ).rejects.toThrow(/list not found/i)
  })

  it('prevents unauth user from using method', async () => {
    // arrange
    const { findByMealPlanId } = createCaller({
      db,
      req: {
        // no Auth header
        header: () => undefined,
      } as any,
    })

    // act & assert
    await expect(findByMealPlanId({ mealPlanId: 289 })).rejects.toThrowError(
      /unauthenticated/i
    )
  })
})
