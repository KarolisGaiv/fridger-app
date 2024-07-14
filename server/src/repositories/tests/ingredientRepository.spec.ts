import { createTestDatabase } from '@tests/utils/database'
import { fakeIngredient } from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, selectAll, clearTables } from '@tests/utils/records'
import { ingredientRepository } from '../ingredientRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = ingredientRepository(db)

describe('create', () => {
  it('should create a new ingredient', async () => {
    const ingredient = fakeIngredient()
    const createdIngredient = await repository.create(ingredient)

    expect(createdIngredient).toEqual({
      name: ingredient.name,
      id: ingredient.id,
    })
  })
})

describe('findByName', () => {
  const ingredient = {
    name: 'milk',
  }
  beforeAll(async () => {
    await insertAll(db, 'ingredient', ingredient)
  })

  afterAll(async () => {
    await clearTables(db, ['ingredient'])
  })

  it('should find ingredient by name', async () => {
    const foundIngredient = await repository.findByName(ingredient.name)

    expect(foundIngredient).toMatchObject({
      name: ingredient.name,
    })
  })

  it('should return nothing if ingredient is not found by name', async () => {
    const foundIngredient = await repository.findByName('nonExistingINGR')

    expect(foundIngredient).toBeUndefined()
  })
})

describe('findAll', () => {
    afterAll(async () => {
      await clearTables(db, ['ingredient'])
    })
  
    it('should return empty array if there are no ingredients', async () => {
      const ingredients = await repository.findAll()
      expect(ingredients).toStrictEqual([])
    })
  
    it('should find all ingredients from the database', async () => {
      await insertAll(db, "ingredient", [fakeIngredient(), fakeIngredient(), fakeIngredient()])
      const meals = await repository.findAll()
      expect(meals).toHaveLength(3)
    })
  })
