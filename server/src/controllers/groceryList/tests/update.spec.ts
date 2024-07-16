import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables } from '@tests/utils/records'
import { fakeUser, fakeMealPlan } from '@server/entities/tests/fakes'
import groceryListRouter from '..'

let user: any
let mealPlan: any
let groceryList: any

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(groceryListRouter)
const { update } = createCaller({ db })

async function createFakeGroceryList() {
  const list = {
    mealPlanId: mealPlan.id,
    product: 'Apples',
    quantity: 5,
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
  groceryList = await createFakeGroceryList()
})

describe('update', () => {
  it('should update an existing grocery list item', async () => {
    const updates = {
      product: 'Oranges',
      quantity: 10,
    }

    const updatedGroceryList = await update({
      groceryListId: groceryList.id,
      updateInfo: updates,
    })

    expect(updatedGroceryList).toEqual(
      expect.objectContaining({
        mealPlanId: groceryList.mealPlanId,
        product: updates.product,
        quantity: updates.quantity,
      })
    )
  })

  it('should throw an error if the grocery list item is not found', async () => {
    const nonExistentId = 999 // Assuming 999 does not exist in your test data

    await expect(
      update({
        groceryListId: nonExistentId,
        updateInfo: { product: 'Oranges' },
      })
    ).rejects.toThrow(/list not found/i)
  })
})
