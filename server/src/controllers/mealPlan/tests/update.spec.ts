import { createCallerFactory } from '@server/trpc'
import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables } from '@tests/utils/records'
import { fakeUser } from '@server/entities/tests/fakes'
import mealPlanRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealPlanRouter)
const { update } = createCaller({ db })
let user: any
let mealPlan: any

beforeEach(async () => {
  await clearTables(db, ['mealPlan', 'user'])
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  const mealPlanData = { userId: user.id, planName: 'Initial Plan' }
  ;[mealPlan] = await insertAll(db, 'mealPlan', [mealPlanData])
})

describe('updateMealPlan', () => {
  it('should update an existing meal plan', async () => {
    const updates = { planName: 'Updated Plan' }

    const result = await update({ id: mealPlan.id, updates })

    expect(result).toEqual(expect.objectContaining({ ...updates }))
  })

  it('should throw an error if the meal plan does not exist', async () => {
    const nonExistentId = 999
    const updates = { planName: 'Non-existent Plan' }

    await expect(update({ id: nonExistentId, updates })).rejects.toThrowError(
      /Meal plan not found/i
    )
  })
})
