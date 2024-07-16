import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables } from '@tests/utils/records'
import { fakeUser, fakeMealPlan } from '@server/entities/tests/fakes'
import groceryListRouter from '..'

let user: any
let mealPlan: any

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(groceryListRouter)
const { findById } = createCaller({ db })

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
  it('should retrieve a grocery list by ID', async () => {
    const fakeGroceryList = await createFakeGroceryList()
    const result = await findById({ id: fakeGroceryList.id })

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

    await expect(findById({ id: nonExistentId })).rejects.toThrow(
      /list not found/i
    )
  })
})
