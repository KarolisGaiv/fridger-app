/* eslint-disable prefer-destructuring */
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

it('should find all meals by meal plan ID', async () => {
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

  await repository.create(
    meal.name,
    mealPlan.planName,
    assignedDay,
    type,
    user.id
  )

  await repository.create(
    meal2.name,
    mealPlan.planName,
    assignedDay,
    type,
    user.id
  )

  await repository.create(
    meal2.name,
    mealPlan2.planName,
    assignedDay,
    type,
    user.id
  )

  // act
  const result1 = await repository.findMealsByPlan(mealPlan.id)
  const result2 = await repository.findMealsByPlan(mealPlan2.id)
  const result3 = await repository.findMealsByPlan(20)

  // assert
  expect(result1).toHaveLength(2)
  expect(result2).toHaveLength(1)
  expect(result3).toHaveLength(0)
})

describe('fetchPlannedMeals', () => {
  it('should find all planned meals by plan name', async () => {
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

    await repository.create(
      meal.name,
      mealPlan.planName,
      assignedDay,
      type,
      user.id
    )

    await repository.create(
      meal2.name,
      mealPlan.planName,
      assignedDay,
      type,
      user.id
    )

    await repository.create(
      meal2.name,
      mealPlan2.planName,
      assignedDay,
      type,
      user.id
    )

    // act
    const result = await repository.fetchPlannedMeals(
      mealPlan.planName,
      user.id
    )

    expect(result).toHaveLength(2)
  })

  it('should throw error if provided meal plan does not exist', async () => {
    // arrange
    await insertAll(db, 'mealPlan', {
      ...fakeMealPlan(),
      userId: user.id,
    })

    await insertAll(db, 'meal', {
      ...fakeMeal(),
      user: user.id,
      mealPlan: mealPlan.id,
    })

    const assignedDay = 5
    const type = 'lunch'

    await repository.create(
      meal.name,
      mealPlan.planName,
      assignedDay,
      type,
      user.id
    )

    await expect(
      repository.fetchPlannedMeals('no plan', user.id)
    ).rejects.toThrowError(/Meal Plan with name "no plan" not found/)
  })
})

describe('toggleCompletionStatus', () => {
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

    await repository.create(
      meal.name,
      mealPlan.planName,
      assignedDay,
      type,
      user.id
    )

    await repository.create(
      meal2.name,
      mealPlan.planName,
      assignedDay,
      type,
      user.id
    )

    await repository.create(
      meal2.name,
      mealPlan2.planName,
      assignedDay,
      type,
      user.id
    )

    const dataBefore = await repository.fetchPlannedMeals(
      mealPlan.planName,
      user.id
    )

    let meal1Data = dataBefore[0]
    expect(meal1Data.completed).toBe(false)

    // act
    await repository.toggleCompletionStatus(
      meal1Data.name,
      meal1Data.assignedDay,
      meal1Data.type!,
      user.id
    )

    const dataAfter = await repository.fetchPlannedMeals(
      mealPlan.planName,
      user.id
    )
    meal1Data = dataAfter[0]
    expect(meal1Data.completed).toBe(true)
  })
})

describe('removeMealFromPlan', () => {
  it('should remove meal from meal plan schedule table', async () => {
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

    await repository.create(
      meal.name,
      mealPlan.planName,
      assignedDay,
      type,
      user.id
    )

    await repository.create(
      meal2.name,
      mealPlan.planName,
      assignedDay,
      type,
      user.id
    )

    await repository.create(
      meal2.name,
      mealPlan2.planName,
      assignedDay,
      type,
      user.id
    )

    const dataBefore = await selectAll(db, 'mealPlanSchedule')

    expect(dataBefore).toHaveLength(3)

    await repository.removeMealFromPlan(
      meal.name,
      mealPlan.planName,
      user.id,
      assignedDay,
      type
    )

    const dataAfter = await selectAll(db, 'mealPlanSchedule')
    expect(dataAfter).toHaveLength(2)
  })
})
