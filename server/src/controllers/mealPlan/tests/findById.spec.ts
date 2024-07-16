import { createCallerFactory } from '@server/trpc'
import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables } from '@tests/utils/records'
import { fakeUser } from '@server/entities/tests/fakes'
import mealPlanRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealPlanRouter)
const { findById } = createCaller({ db })
let user: any

beforeEach(async () => {
  await clearTables(db, ['mealPlan', 'user'])
  ;[user] = await insertAll(db, 'user', [fakeUser()])
})

describe('findById', () => {
  it('should retrieve a meal plan by ID', async () => {
    const mealPlan = {
      userId: user.id,
      planName: 'Test Meal Plan',
    }
    const [insertedMealPlan] = await insertAll(db, 'mealPlan', [mealPlan])

    const result = await findById({ id: insertedMealPlan.id })

    expect(result).toEqual(expect.objectContaining(mealPlan))
  })

  it('should throw an error if meal plan ID does not exist', async () => {
    const nonExistentId = 999

    await expect(findById({ id: nonExistentId })).rejects.toThrowError(
      /Meal plan not found/
    )
  })
})
