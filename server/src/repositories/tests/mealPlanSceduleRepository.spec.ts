import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { fakeMeal, fakeMealPlan, fakeUser } from '@server/entities/tests/fakes'
import { insertAll, selectAll } from '@tests/utils/records'
import { mealPlanScheduleRepository } from '../mealPlanScheduleRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = mealPlanScheduleRepository(db)
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

it('should create a new record in the table', async () => {
  // arrange
  const assignedDay = 5
  const type = 'lunch'

  expect(await selectAll(db, 'mealPlanSchedule')).toHaveLength(0)

  // act
  await repository.create(
    meal.name,
    mealPlan.planName,
    assignedDay,
    type,
    user.id
  )

  // assert
  expect(await selectAll(db, 'mealPlanSchedule')).toHaveLength(1)
  const [data] = await selectAll(db, 'mealPlanSchedule')

  expect(data.mealId).toEqual(meal.id)
  expect(data.mealPlanId).toEqual(mealPlan.id)
  expect(data.assignedDay).toEqual(assignedDay)
  expect(data.type).toEqual(type)
})

it('does not allow creating a new record with the same data', async () => {
  // arrange
  const assignedDay = 5
  const type = 'lunch'

  // Initially, the table should be empty
  expect(await selectAll(db, 'mealPlanSchedule')).toHaveLength(0)

  // Act: Create the first record
  await repository.create(
    meal.name,
    mealPlan.planName,
    assignedDay,
    type,
    user.id
  )
  expect(await selectAll(db, 'mealPlanSchedule')).toHaveLength(1)

  // Assert: Attempt to create a duplicate record and expect an error
  await expect(
    repository.create(meal.name, mealPlan.planName, assignedDay, type, user.id)
  ).rejects.toThrowError(/duplicate key value violates unique constraint/i)
})
