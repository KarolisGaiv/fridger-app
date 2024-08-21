import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { fakeUser } from '@server/entities/tests/fakes'
import { insertAll, selectAll } from '@tests/utils/records'
import { mealPlanRepository } from '../mealPlanRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = mealPlanRepository(db)
let user: any

beforeEach(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
})

describe('create', () => {
  it('should create new meal plan', async () => {
    const mealPlan = {
      userId: user.id,
      planName: 'My Meal Plan',
      isActive: true,
    }
    const createdMealPlan = await repository.create(mealPlan)
    expect(createdMealPlan).toEqual(expect.objectContaining(mealPlan))
  })

  it('should deactivate other active meal plans for the same user', async () => {
    // Create an active meal plan
    const activeMealPlan = {
      userId: user.id,
      planName: 'FIRST ACTIVE Meal Plan',
      isActive: true,
    }
    const createdActiveMealPlan = await repository.create(activeMealPlan)
    const firstActiveMealPlanID = createdActiveMealPlan.id
    let firstActiveMealPlanDetails = await repository.findById(
      firstActiveMealPlanID
    )
    expect(firstActiveMealPlanDetails?.isActive).toBe(true)

    // Create a new meal plan that should activate and deactivate others
    const newSecondMealPlan = {
      userId: user.id,
      planName: 'SECOND ACTIVE Meal Plan',
      isActive: true,
    }
    const createdSecondMealPlan = await repository.create(newSecondMealPlan)
    const secondActiveMealPlanID = createdSecondMealPlan.id
    const secondActiveMealPlanDetails = await repository.findById(
      secondActiveMealPlanID
    )

    // Verify that the new meal plan is active
    expect(secondActiveMealPlanDetails?.isActive).toBe(true)

    // Verify that the previously active meal plan is now inactive
    firstActiveMealPlanDetails = await repository.findById(
      firstActiveMealPlanID
    )
    expect(firstActiveMealPlanDetails?.isActive).toBe(false)
  })

  it('should not deactivate other meal plans if new plan is inactive', async () => {
    // Create an active meal plan
    const activeMealPlan = {
      userId: user.id,
      planName: 'Active Meal Plan',
      isActive: true,
    }
    const oldPlan = await repository.create(activeMealPlan)

    // Create a new meal plan that is inactive
    const newMealPlan = {
      userId: user.id,
      planName: 'Inactive Meal Plan',
      isActive: false,
    }
    const createdMealPlan = await repository.create(newMealPlan)

    // Verify that the new meal plan is inactive
    expect(createdMealPlan.isActive).toBe(false)

    // Verify that the previous active meal plan remains active
    const previousActivePlan = await repository.findById(oldPlan.id)
    expect(previousActivePlan?.isActive).toBe(true)
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

describe('update', () => {
  it('should update an existing meal plan', async () => {
    const initialMealPlan = {
      userId: user.id,
      planName: 'Initial Plan Name',
    }
    const [insertedMealPlan] = await insertAll(db, 'mealPlan', [
      initialMealPlan,
    ])

    const updates = {
      planName: 'Updated Plan Name',
    }

    const updatedMealPlan = await repository.update(
      insertedMealPlan.id,
      updates
    )

    expect(updatedMealPlan).toEqual(
      expect.objectContaining({
        userId: insertedMealPlan.userId,
        planName: updates.planName,
      })
    )
  })

  it('should return undefined if trying to update a non-existent meal plan', async () => {
    const nonExistentId = 999
    const updates = {
      planName: 'Updated Plan Name',
    }

    const updatedMealPlan = await repository.update(nonExistentId, updates)

    expect(updatedMealPlan).toBeUndefined()
  })
})

describe('deleteById', () => {
  it('should delete an existing meal plan', async () => {
    const mealPlan = {
      userId: user.id,
      planName: 'Plan to delete',
    }
    const [insertedMealPlan] = await insertAll(db, 'mealPlan', [mealPlan])

    await repository.deleteById(insertedMealPlan.id)

    const foundMealPlan = await repository.findById(insertedMealPlan.id)
    expect(foundMealPlan).toBeUndefined()
  })

  it('should not throw an error if trying to delete a non-existent meal plan', async () => {
    const nonExistentId = 999

    // Ensure that no error is thrown
    await expect(repository.deleteById(nonExistentId)).resolves.not.toThrow()

    // Additional check: ensure no meal plan with nonExistentId exists
    const foundMealPlan = await repository.findById(nonExistentId)
    expect(foundMealPlan).toBeUndefined()
  })
})

describe('findActiveMealPlan', () => {
  it('should find active meal plan for the user', async () => {
    const firstPlan = {
      planName: 'First ACTIVE meal plan',
      userId: user.id,
      isActive: true,
    }
    await repository.create(firstPlan)

    const secondPlan = {
      planName: 'SECOND ACTIVE meal plan',
      userId: user.id,
      isActive: true,
    }

    await repository.create(secondPlan)

    const result = await repository.findActiveMealPlan(user.id)
    expect(result?.planName).toBe('SECOND ACTIVE meal plan')
  })
})
