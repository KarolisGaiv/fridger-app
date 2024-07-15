import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { fakeMealPlan, fakeUser } from '@server/entities/tests/fakes'
import { insertAll, clearTables } from '@tests/utils/records'
import { groceryListRepository } from '../groceryListRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = groceryListRepository(db)
let user: any // Adjust type as per your User type
let mealPlan: any // Adjust type as per your MealPlan type

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
    // const [user] = await insertAll(db, "user", [fakeUser()])
    // const [mealPlan] = await insertAll(db, "mealPlan", [fakeMealPlan({userId: user.id})])
    const newGroceryList = {
      mealPlanId: mealPlan.id,
      product: 'Apples',
      quantity: 5,
    }

    const createdGroceryList = await repository.create(newGroceryList)

    expect(createdGroceryList).toEqual(expect.objectContaining(newGroceryList))
  })
})
