/* eslint-disable prefer-destructuring */
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

it('should change meal completion status', async () => {
  // arrange
  const [mealPlan2] = await insertAll(db, 'mealPlan', {
    ...fakeMealPlan(),
    userId: user.id,
  })

  const [meal2] = await insertAll(db, 'meal', {
    ...fakeMeal(),
    user: user.id,
    mealPlan: mealPlan.id,
  })

  const assignedDay = 5
  const type = 'lunch'

  await insertAll(db, 'mealPlanSchedule', [
    {
      type,
      assignedDay,
      mealId: meal.id,
      mealPlanId: mealPlan.id,
      userId: user.id,
    },
    {
      type,
      assignedDay,
      mealId: meal2.id,
      mealPlanId: mealPlan.id,
      userId: user.id,
    },
    {
      type,
      assignedDay,
      mealId: meal.id,
      mealPlanId: mealPlan2.id,
      userId: user.id,
    },
  ])

  const { toggleCompletionStatus } = createCaller(authContext({ db }, user))

  const dataBefore = await selectAll(db, 'mealPlanSchedule')

  const meal1Data = dataBefore[0]

  expect(meal1Data.completed).toBe(false)

  // act
  await toggleCompletionStatus({
    type,
    assignedDay,
    mealName: meal.name,
  })

  const dataAfter = await selectAll(db, 'mealPlanSchedule')
  const meal2Data = dataAfter[1]

  // assert
  expect(meal1Data.mealId).toBe(meal2Data.mealId)
  expect(meal2Data.completed).toBe(true)
})

it('should prevent unauth user to use method', async () => {
  const { toggleCompletionStatus } = createCaller({
    db,
    req: {
      // no Auth header
      header: () => undefined,
    } as any,
  })

  // act & assert
  await expect(
    toggleCompletionStatus({
      type: 'lunch',
      assignedDay: 6,
      mealName: 'mealName',
    })
  ).rejects.toThrowError(/unauthenticated/i)
})
