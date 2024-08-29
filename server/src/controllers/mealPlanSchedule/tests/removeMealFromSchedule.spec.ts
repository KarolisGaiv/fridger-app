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

it('should remove meal from meal plan schedule', async () => {
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

  const dataBefore = await selectAll(db, 'mealPlanSchedule')
  expect(dataBefore).toHaveLength(3)

  const { removeMealFromSchedule } = createCaller(authContext({ db }, user))

  // act
  await removeMealFromSchedule({
    type,
    assignedDay,
    mealPlan: mealPlan.planName,
    mealName: meal.name,
  })

  const dataAfter = await selectAll(db, 'mealPlanSchedule')
  expect(dataAfter).toHaveLength(2)
})

it('should prevent unauth user to use method', async () => {
  const { removeMealFromSchedule } = createCaller({
    db,
    req: {
      // no Auth header
      header: () => undefined,
    } as any,
  })

  // act & assert
  await expect(
    removeMealFromSchedule({
      type: 'lunch',
      assignedDay: 6,
      mealName: 'mealName',
      mealPlan: 'test',
    })
  ).rejects.toThrowError(/unauthenticated/i)
})
