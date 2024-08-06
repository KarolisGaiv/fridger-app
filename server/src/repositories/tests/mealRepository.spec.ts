import { createTestDatabase } from '@tests/utils/database'
import { fakeMeal } from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables } from '@tests/utils/records'
import { mealRepository } from '../mealRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = mealRepository(db)

afterEach(async () => {
    await clearTables(db, ['meal'])
})

describe.skip('create', () => {
  it('should create a new meal', async () => {
    const meal = fakeMeal()
    const createdMeal = await repository.create(meal)

    expect(createdMeal).toEqual({
      calories: meal.calories,
      name: meal.name,
      id: meal.id,
    })
  })
})

describe.skip('findByName', () => {
  const meal = {
    name: 'pancakes',
    calories: 650,
  }
  beforeAll(async () => {
    await insertAll(db, 'meal', meal)
  })

  it('should find meal by name', async () => {
    const foundMeal = await repository.findByName(meal.name)

    expect(foundMeal).toMatchObject({
      name: meal.name,
      calories: meal.calories,
    })
  })

  it('should return nothing if meal is not found by name', async () => {
    const foundMeal = await repository.findByName('nonExistingMeal')

    expect(foundMeal).toBeUndefined()
  })
})

describe.skip('findAll', () => {
  it('should return empty array if there are no meals', async () => {
    await clearTables(db, ['meal'])
    const meals = await repository.findAll()
    expect(meals).toStrictEqual([])
  })

  it('should find all meals from the database', async () => {
    await clearTables(db, ['meal'])
    await insertAll(db, 'meal', [fakeMeal(), fakeMeal(), fakeMeal()])
    const meals = await repository.findAll()
    expect(meals).toHaveLength(3)
  })
})

describe.skip('updateMeal', async () => {
  const meal = {
    name: 'pancakes',
    calories: 650,
  }
  beforeAll(async () => {
    await insertAll(db, 'meal', meal)
  })

  it('should update meal sucessfully', async () => {
    const updateData = {
      calories: 550,
    }
    await repository.updateMeal('pancakes', updateData)
    const updatedMeal = await repository.findByName(meal.name)
    expect(updatedMeal?.calories).toBe(updateData.calories)
    expect(updatedMeal?.name).toBe('pancakes')
  })

  it('should not update other meals if specific meal not found', async () => {
    const updateData = {
      calories: 550,
    }

    await repository.updateMeal('no meal exist', updateData)
    const existingMeal = await repository.findByName(meal.name)
    expect(existingMeal?.calories).toBe(meal.calories)
    expect(existingMeal?.name).toBe(meal.name)
  })
})

describe.skip('delete', () => {
  const meal = {
    name: 'pancakes',
    calories: 650,
  }
  beforeAll(async () => {
    await insertAll(db, 'meal', meal)
  })

  it('should delete meal', async () => {
    await repository.deleteMeal('pancakes')
    const database = await repository.findAll()
    expect(database).toHaveLength(0)
  })

  it('should do nothing if meal was not found', async () => {
    await repository.deleteMeal('KEBAB')
    const database = await repository.findAll()
    expect(database).toHaveLength(3)
    expect(database[0]).toMatchObject({
      name: meal.name,
      calories: meal.calories,
    })
  })
})
