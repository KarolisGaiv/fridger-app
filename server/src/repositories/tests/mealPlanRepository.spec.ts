import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { fakeUser } from '@server/entities/tests/fakes'
import { insertAll, clearTables } from '@tests/utils/records'
import { mealPlanRepository } from '../mealPlanRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = mealPlanRepository(db)
let user: any

beforeEach(async () => {
  await clearTables(db, ['mealPlan', 'user'])
  ;[user] = await insertAll(db, 'user', [fakeUser()])
})

describe('create', () => {
  it('should create new meal plan', async () => {
    const mealPlan = {
      userId: user.id,
      planName: 'My Meal Plan',
    }
    const createdMealPlan = await repository.create(mealPlan)
    expect(createdMealPlan).toEqual(expect.objectContaining(mealPlan))
  })

  it('throws error if missing plan name', async () => {
    const mealPlan = {
      userId: user.id,
    }
    await expect(repository.create(mealPlan)).rejects.toThrowError(
      /violates not-null constraint/
    )
  })
})

describe('findById', () => {
  it('should retrieve a meal plan by ID', async () => {
    const mealPlan = {
      userId: user.id,
      planName: 'Test Meal Plan',
    }
    const [insertedMealPlan] = await insertAll(db, 'mealPlan', [mealPlan])

    const foundMealPlan = await repository.findById(insertedMealPlan.id)

    expect(foundMealPlan).toEqual(expect.objectContaining(mealPlan))
  })

  it('should return undefined if meal plan ID does not exist', async () => {
    const nonExistentId = 999

    const foundMealPlan = await repository.findById(nonExistentId)

    expect(foundMealPlan).toBeUndefined()
  })
})

describe('findByUserId', () => {
  it('should retrieve all meal plans for a specific user', async () => {
    const [user2] = await insertAll(db, 'user', [fakeUser()])

    const mealPlansUser1 = [
      { userId: user.id, planName: 'Plan 1' },
      { userId: user.id, planName: 'Plan 2' },
    ]

    const mealPlansUser2 = [
      { userId: user2.id, planName: 'Plan 3' },
      { userId: user2.id, planName: 'Plan 4' },
    ]

    await insertAll(db, 'mealPlan', [...mealPlansUser1, ...mealPlansUser2])

    const foundMealPlans = await repository.findByUserId(user.id)

    expect(foundMealPlans.length).toBe(mealPlansUser1.length)
    expect(foundMealPlans).toEqual(
      expect.arrayContaining([
        expect.objectContaining(mealPlansUser1[0]),
        expect.objectContaining(mealPlansUser1[1]),
      ])
    )
  })

  it('should return an empty array if the user has no meal plans', async () => {
    const [userWithNoPlans] = await insertAll(db, 'user', [fakeUser()])

    const foundMealPlans = await repository.findByUserId(userWithNoPlans.id)

    expect(foundMealPlans).toEqual([])
  })
})
