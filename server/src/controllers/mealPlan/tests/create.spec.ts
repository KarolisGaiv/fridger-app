import { createCallerFactory } from '@server/trpc'
import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables } from '@tests/utils/records'
import { fakeUser } from '@server/entities/tests/fakes'
import mealPlanRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealPlanRouter)
const { create } = createCaller({ db })
let user: any

beforeEach(async () => {
  await clearTables(db, ['mealPlan', 'user'])
  ;[user] = await insertAll(db, 'user', [fakeUser()])
})

describe('createMealPlan', () => {
  it('should create a new meal plan', async () => {
    const input = {
      userId: user.id,
      planName: 'Test Meal Plan',
    }

    const result = await create(input)

    expect(result).toEqual(expect.objectContaining(input))
  })
})
