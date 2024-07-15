import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables, selectAll } from '@tests/utils/records'
import { fakeUser, fakeMealPlan } from '@server/entities/tests/fakes'
import groceryListRouter from '..'

let user: any
let mealPlan: any
let groceryList: any

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(groceryListRouter)
const { deleteList } = createCaller({ db })

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
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  ;[mealPlan] = await insertAll(db, 'mealPlan', [
    fakeMealPlan({ userId: user.id }),
  ])
  groceryList = await createFakeGroceryList()
})

afterEach(async () => {
  await clearTables(db, ['groceryList', 'mealPlan', 'user'])
})

describe('deleteById', () => {
  it('should delete an existing grocery list item', async () => {
    const beforeDeletion = await selectAll(db, 'groceryList')
    expect(beforeDeletion).toHaveLength(1)

    await expect(deleteList({ id: groceryList.id })).resolves.toBeUndefined()

    const deletedItems = await selectAll(db, 'groceryList')
    expect(deletedItems).toHaveLength(0)
  })
})
