import { authContext } from '@tests/utils/context'
import { createCallerFactory } from '@server/trpc'
import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import { fakeUser, fakeMealPlan } from '@server/entities/tests/fakes'
import mealPlanRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealPlanRouter)
let user: any
let mealPlan: any

beforeEach(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  const mealPlanData = { userId: user.id, planName: 'Initial Plan' }
  ;[mealPlan] = await insertAll(db, 'mealPlan', [mealPlanData])
})

describe('updateMealPlan', () => {
  it('should update meal plan', async () => {
    // arrange
    const { update } = createCaller(authContext({ db }, user))
    const updates = { planName: 'Updated plan' }
    expect(mealPlan.planName).toBe('Initial Plan')

    // act
    const result = await update({ id: mealPlan.id, updates })

    // assert
    expect(result.planName).toBe('Updated plan')
  })

  it('should throw a NOT_FOUND error if meal plan is not found', async () => {
    // Arrange
    const { update } = createCaller(authContext({ db }, user))

    // Act & Assert
    await expect(
      update({ id: 999, updates: { planName: 'Updated Plan' } })
    ).rejects.toThrowError(/meal plan not found/i)
  })

  it('should throw a FORBIDDEN error if trying to update a meal plan not owned by the authenticated user', async () => {
    // Arrange
    const [otherUser] = await insertAll(db, 'user', [fakeUser()])
    const [otherUserMealPlan] = await insertAll(db, 'mealPlan', [
      fakeMealPlan({ userId: otherUser.id }),
    ])
    const { update } = createCaller(authContext({ db }, user))

    // Act & Assert
    await expect(
      update({
        id: otherUserMealPlan.id,
        updates: { planName: 'Updated Plan' },
      })
    ).rejects.toThrowError(/Not authorized to access this meal plan/i)
  })

  it('prevents unauth user from using method', async () => {
    // arrange
    const { update } = createCaller({
      db,
      req: {
        // no Auth header
        header: () => undefined,
      } as any,
    })

    // act & assert
    await expect(
      update({ id: 999, updates: { planName: 'Updated Plan' } })
    ).rejects.toThrowError(/unauthenticated/i)
  })
})
