import { createTestDatabase } from '@tests/utils/database'
import { fakeMeal, fakeUser, fakeMealPlan } from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables, selectAll } from '@tests/utils/records'
import { mealRepository } from '../mealRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = mealRepository(db)
let user: any
let user2: any

beforeEach(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
})

describe('create', () => {
  it('should create a new meal without optional parameters', async () => {
    const meal = {
      ...fakeMeal(),
      user: user.id,
    }
    const createdMeal = await repository.create(meal)

    expect(createdMeal).toEqual({
      calories: meal.calories,
      name: meal.name,
      id: meal.id,
      type: null,
    })
  })

  it('should create a new meal with optional parameters', async () => {
    const [plan] = await insertAll(db, 'mealPlan', {
      ...fakeMealPlan(),
      userId: user.id,
    })
    const meal = {
      ...fakeMeal(),
      user: user.id,
      mealPlan: plan.id,
      type: 'lunch',
      assignedDay: 2,
    }

    const createdMeal = await repository.create(meal)
    expect(createdMeal).toEqual({
      calories: meal.calories,
      name: meal.name,
      id: meal.id,
      type: 'lunch',
    })

    const fullData = (await selectAll(db, 'meal'))[0]
    expect(fullData).toMatchObject({
      type: 'lunch',
      assignedDay: meal.assignedDay,
      mealPlan: meal.mealPlan,
    })
  })

  it('should not allow create new meal with day not between 1 and 7', async () => {
    const meal = {
      ...fakeMeal(),
      user: user.id,
      assignedDay: 42,
    }

    await expect(repository.create(meal)).rejects.toThrow(
      /violates check constraint/i
    )
  })

  it('should not allow create new meal with non existing meal types', async () => {
    const meal = {
      ...fakeMeal(),
      user: user.id,
      type: 'CHEAT MEAL',
    }

    await expect(repository.create(meal)).rejects.toThrow(
      /violates check constraint/i
    )
  })
})

describe('findByName', async () => {
  beforeAll(async () => {
    ;[user] = await insertAll(db, 'user', [fakeUser()])
  })

  it('should find meal by name', async () => {
    const meal = {
      ...fakeMeal(),
      user: user.id,
    }
    await insertAll(db, 'meal', meal)

    const foundMeal = await repository.findByName(meal.name, user.id)

    expect(foundMeal).toMatchObject({
      name: meal.name,
      calories: meal.calories,
    })
  })

  it('should return nothing if meal is not found by name', async () => {
    const foundMeal = await repository.findByName('nonExistingMeal', user.id)

    expect(foundMeal).toBeUndefined()
  })
})

describe('findAll', async () => {
  it('should return empty array if there are no meals', async () => {
    ;[user] = await insertAll(db, 'user', [fakeUser()])
    await clearTables(db, ['meal'])
    const meals = await repository.findAll(user.id)
    expect(meals).toStrictEqual([])
  })

  it('should find all meals for SPECIFIC user from the database', async () => {
    ;[user] = await insertAll(db, 'user', [fakeUser()])
    ;[user2] = await insertAll(db, 'user', [fakeUser()])
    await clearTables(db, ['meal'])
    await insertAll(db, 'meal', [
      {
        ...fakeMeal(),
        user: user.id,
      },
      {
        ...fakeMeal(),
        user: user.id,
      },
      {
        ...fakeMeal(),
        user: user.id,
      },
      {
        ...fakeMeal(),
        user: user2.id,
      },
      {
        ...fakeMeal(),
        user: user2.id,
      },
    ])

    const meals = await repository.findAll(user.id)
    expect(meals).toHaveLength(3)
    expect(meals).not.toHaveLength(5)
    const meals2 = await repository.findAll(user2.id)
    expect(meals2).toHaveLength(2)
  })
})

describe('updateMeal', async () => {
  it('should update meal sucessfully', async () => {
    ;[user] = await insertAll(db, 'user', [fakeUser()])
    const meal = {
      name: 'pancakes',
      calories: 650,
      user: user.id,
    }

    await insertAll(db, 'meal', meal)
    const updateData = {
      calories: 550,
    }
    await repository.updateMeal(user.id, 'pancakes', updateData)

    const updatedMeal = await repository.findByName(meal.name, user.id)
    expect(updatedMeal?.calories).toBe(updateData.calories)
    expect(updatedMeal?.name).toBe('pancakes')
  })

  it('should not update other meals if specific meal not found', async () => {
    ;[user] = await insertAll(db, 'user', [fakeUser()])
    const meal = {
      name: 'pancakes',
      calories: 650,
      user: user.id,
    }

    await insertAll(db, 'meal', meal)

    const updateData = {
      calories: 550,
    }

    await repository.updateMeal(user.id, 'no meal exist', updateData)
    const existingMeal = await repository.findByName(meal.name, user.id)
    expect(existingMeal?.calories).toBe(meal.calories)
    expect(existingMeal?.name).toBe(meal.name)
  })
})

describe('delete', async () => {
  beforeAll(async () => {
    ;[user] = await insertAll(db, 'user', [fakeUser()])
    ;[user2] = await insertAll(db, 'user', [fakeUser()])
  })

  it('should delete meal', async () => {
    const meal = {
      name: 'pancakes',
      calories: 650,
      user: user.id,
    }
    const meal2 = {
      name: 'test',
      calories: 650,
      user: user2.id,
    }
    await insertAll(db, 'meal', [meal, meal2])

    const databaseBeforeDeletion = await selectAll(db, 'meal')
    expect(databaseBeforeDeletion).toHaveLength(2)

    await repository.deleteMeal('pancakes', user.id)
    const databaseAfterDeletion = await selectAll(db, 'meal')
    expect(databaseAfterDeletion).toHaveLength(1)

    const userMeals = await repository.findAll(user.id)
    expect(userMeals).toHaveLength(0)

    const userMeals2 = await repository.findAll(user2.id)
    expect(userMeals2).toHaveLength(1)
  })

  it('should do nothing if meal was not found', async () => {
    const meal2 = {
      name: 'test',
      calories: 650,
      user: user2.id,
    }
    await insertAll(db, 'meal', meal2)

    await repository.deleteMeal('NON EXISTING MEAL', user2.id)
    const database = await repository.findAll(user2.id)
    expect(database).toHaveLength(1)
  })
})

describe('findByMealPlanID', () => {
  it('should return array of meals belonging to specific meal plan', async () => {
    const [plan1, plan2] = await insertAll(db, 'mealPlan', [
      { ...fakeMealPlan(), userId: user.id },
      { ...fakeMealPlan(), userId: user2.id },
    ])
    await insertAll(db, 'meal', [
      {
        ...fakeMeal(),
        user: user.id,
        mealPlan: plan1.id,
      },
      {
        ...fakeMeal(),
        user: user.id,
        mealPlan: plan1.id,
      },
      {
        ...fakeMeal(),
        user: user.id,
        mealPlan: plan1.id,
      },
      {
        ...fakeMeal(),
        user: user2.id,
        mealPlan: plan2.id,
      },
      {
        ...fakeMeal(),
        user: user2.id,
        mealPlan: plan2.id,
      },
    ])

    const user1Meals = await repository.findByMealPlanID(plan1.id, user.id)
    expect(user1Meals).toHaveLength(3)

    const user2Meals = await repository.findByMealPlanID(plan2.id, user2.id)
    expect(user2Meals).toHaveLength(2)
  })
})
