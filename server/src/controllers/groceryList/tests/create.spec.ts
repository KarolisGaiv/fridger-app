import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import { fakeUser, fakeMealPlan } from '@server/entities/tests/fakes'
import groceryListRouter from '..'

let user: any
let mealPlan: any

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(groceryListRouter)
const { create } = createCaller({ db })

beforeAll(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  ;[mealPlan] = await insertAll(db, 'mealPlan', [
    fakeMealPlan({ userId: user.id }),
  ])
})

describe('create', () => {
  it('should create a new grocery list item', async () => {
    const newGroceryList = {
      mealPlanId: mealPlan.id,
      product: 'Apples',
      quantity: 5,
    }

    const result = await create(newGroceryList)

    expect(result).toEqual({
      result: expect.objectContaining({
        mealPlanId: mealPlan.id,
        product: 'Apples',
        quantity: 5,
      }),
    })
  })
})
