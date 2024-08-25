import { authContext } from '@tests/utils/context'
import { createCallerFactory } from '@server/trpc'
import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, selectAll } from '@tests/utils/records'
import { fakeUser, fakeMealPlan, fakeMeal } from '@server/entities/tests/fakes'
import mealPlanSchedule from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealPlanSchedule)
let user: any
let meal: any
let mealPlan: any

beforeEach(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  ;[mealPlan] = await insertAll(db, 'mealPlan', {
    ...fakeMealPlan(),
    userId: user.id,
  })
  ;[meal] = await insertAll(db, 'meal', {
    ...fakeMeal(),
    user: user.id,
    mealPlan: mealPlan.id,
  })
})

it('creates record in meal plan schedule table', async () => {
  // Arrange
  const { create } = createCaller(authContext({ db }, user))
  const assignedDay = 5
  const type = 'lunch'

  expect(await selectAll(db, 'mealPlanSchedule')).toHaveLength(0)

  const inputData = {
    mealName: meal.name,
    mealPlan: mealPlan.planName,
    assignedDay,
    type: 'lunch' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    userId: user.id,
  }

  // Act
  await create(inputData)

  // Assert
  expect(await selectAll(db, 'mealPlanSchedule')).toHaveLength(1)
  const [result] = await selectAll(db, 'mealPlanSchedule')
  expect(result).toBeDefined()
  expect(result.mealId).toEqual(meal.id)
  expect(result.mealPlanId).toEqual(mealPlan.id)
  expect(result.assignedDay).toEqual(assignedDay)
  expect(result.type).toEqual(type)
})

it('prevents unauth user from adding record', async () => {
  // arrange
  const inputData = {
    mealName: meal.name,
    mealPlan: mealPlan.planName,
    assignedDay: 5,
    type: 'lunch' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    userId: user.id,
  }

  const { create } = createCaller({
    db,
    req: {
      // no Auth header
      header: () => undefined,
    } as any,
  })

  // act & assert
  await expect(create(inputData)).rejects.toThrowError(/unauthenticated/i)
})
