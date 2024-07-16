import { createCallerFactory } from '@server/trpc'
import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables } from '@tests/utils/records'
import { fakeUser } from '@server/entities/tests/fakes'
import mealPlanRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealPlanRouter)
const { deleteById } = createCaller({ db })
let user: any

beforeEach(async () => {
  await clearTables(db, ['mealPlan', 'user'])
  ;[user] = await insertAll(db, 'user', [fakeUser()])
})

describe('deleteMealPlan', () => {
  it('should delete an existing meal plan', async () => {
    const mealPlan = {
      userId: user.id,
      planName: 'Test Meal Plan',
    }
    const [insertedMealPlan] = await insertAll(db, 'mealPlan', [mealPlan])

    const res = await deleteById({ id: insertedMealPlan.id })

    const foundMealPlan = await db
      .selectFrom('mealPlan')
      .selectAll()
      .where('id', '=', insertedMealPlan.id)
      .executeTakeFirst()

    expect(foundMealPlan).toBeUndefined()
    expect(res).toEqual({ message: 'Meal plan deleted successfully' })
  })

  it('should throw an error if the meal plan does not exist', async () => {
    const nonExistentId = 999

    await expect(deleteById({ id: nonExistentId })).rejects.toThrowError(
      /Meal plan not found/i
    )
  })
})
