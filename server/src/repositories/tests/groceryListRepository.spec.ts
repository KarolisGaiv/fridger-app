import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { fakeMealPlan, fakeUser } from '@server/entities/tests/fakes'
import { insertAll, clearTables } from '@tests/utils/records'
import { groceryListRepository } from '../groceryListRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = groceryListRepository(db)
let user: any
let mealPlan: any

async function createFakeGroceryList() {
  const list = {
    mealPlanId: mealPlan.id,
    product: 'snake oil',
    quantity: 30,
  }
  const [data] = await insertAll(db, 'groceryList', [list])
  return data.id
}

beforeEach(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  ;[mealPlan] = await insertAll(db, 'mealPlan', [
    fakeMealPlan({ userId: user.id }),
  ])
})

afterEach(async () => {
  // Clear all records after each test
  await clearTables(db, ['groceryList'])
})

describe('create', () => {
  it('should create a new grocery list item', async () => {
    const newGroceryList = {
      mealPlanId: mealPlan.id,
      product: 'Apples',
      quantity: 5,
    }

    const createdGroceryList = await repository.create(newGroceryList)

    expect(createdGroceryList).toEqual(expect.objectContaining(newGroceryList))
  })
})

describe('findById', () => {
  it('should retrieve a grocery list item by ID', async () => {
    const fakeListId = await createFakeGroceryList()
    const foundGroceryList = await repository.findById(fakeListId)
    expect(foundGroceryList).toEqual(
      expect.objectContaining({
        product: 'snake oil',
        quantity: 30,
      })
    )
  })

  it('should return undefined for non-existent ID', async () => {
    const nonExistentId = 999 // Assuming 999 does not exist in your test data
    const foundGroceryList = await repository.findById(nonExistentId)
    expect(foundGroceryList).toBeUndefined()
  })
})
