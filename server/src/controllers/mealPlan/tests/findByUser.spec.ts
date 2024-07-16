import { createCallerFactory } from '@server/trpc'
import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables } from '@tests/utils/records'
import { fakeUser } from '@server/entities/tests/fakes'
import mealPlanRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealPlanRouter)
const { findByUserId } = createCaller({ db })
let user: any

beforeEach(async () => {
  await clearTables(db, ['mealPlan', 'user'])
  ;[user] = await insertAll(db, 'user', [fakeUser()])
})

describe('findByUserId', () => {
  it('should retrieve all meal plans for a specific user', async () => {
    const mealPlans = [
      { userId: user.id, planName: 'Plan 1' },
      { userId: user.id, planName: 'Plan 2' },
    ]

    await insertAll(db, 'mealPlan', mealPlans)

    const result = await findByUserId({ userId: user.id })

    expect(result.length).toBe(mealPlans.length)
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining(mealPlans[0]),
        expect.objectContaining(mealPlans[1]),
      ])
    )
  })

  it('should throw an error if the user has no meal plans', async () => {
    const [userWithNoPlans] = await insertAll(db, 'user', [fakeUser()])

    await expect(
      findByUserId({ userId: userWithNoPlans.id })
    ).rejects.toThrowError(/No meal plans found for this user/)
  })
})
