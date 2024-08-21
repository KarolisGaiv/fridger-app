import { authContext } from '@tests/utils/context'
import { createCallerFactory } from '@server/trpc'
import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, selectAll } from '@tests/utils/records'
import { fakeUser, fakeMealPlan } from '@server/entities/tests/fakes'
import mealPlanRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealPlanRouter)
let user: any
let mealPlan: any

beforeAll(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  const mealPlanData = { userId: user.id, planName: 'Initial Plan' }
  ;[mealPlan] = await insertAll(db, 'mealPlan', [mealPlanData])
  await insertAll(db, 'mealPlan', [
    fakeMealPlan({ userId: user.id }),
    fakeMealPlan({ userId: user.id }),
    fakeMealPlan({ userId: user.id }),
  ])
})

describe('deleteMealPlan', () => {
  it('should delete a meal plan owned by the authenticated user', async () => {
    // Arrange
    const { deleteById } = createCaller(authContext({ db }, user))
    let userPlans = await selectAll(db, 'mealPlan')
    expect(userPlans).toHaveLength(4)
    expect(userPlans[0].planName).toBe('Initial Plan')

    // Act
    const result = await deleteById({ id: mealPlan.id })

    // Assert
    expect(result.message).toBe('Meal plan deleted successfully')
    userPlans = await selectAll(db, 'mealPlan')
    expect(userPlans).toHaveLength(3)
    // Ensure the meal plan is actually deleted
    expect(userPlans[0].planName).not.toBe('Initial Plan')
  })

  it('should throw a NOT_FOUND error if meal plan is not found', async () => {
    // Arrange
    const { deleteById } = createCaller(authContext({ db }, user))

    // Act & Assert
    await expect(deleteById({ id: 999 })).rejects.toThrowError(
      /plan not found/i
    )
  })

  it('should throw a FORBIDDEN error if trying to delete a meal plan not owned by the authenticated user', async () => {
    // Arrange
    const [otherUser] = await insertAll(db, 'user', [fakeUser()])
    const otherUserMealPlan = await insertAll(db, 'mealPlan', [
      fakeMealPlan({ userId: otherUser.id }),
    ])
    const { deleteById } = createCaller(authContext({ db }, user))

    // Act & Assert
    await expect(
      deleteById({ id: otherUserMealPlan[0].id })
    ).rejects.toThrowError(/Not authorized to access this meal plan/i)
  })

  it('prevents unauth user from using method', async () => {
    // arrange
    const { deleteById } = createCaller({
      db,
      req: {
        // no Auth header
        header: () => undefined,
      } as any,
    })

    // act & assert
    await expect(deleteById({ id: 32 })).rejects.toThrowError(
      /unauthenticated/i
    )
  })
})
