import { createTestDatabase } from '@tests/utils/database'
import { fakeIngredient, fakeUser } from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import { ingredientRepository } from '../ingredientRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = ingredientRepository(db)
let user: any
let user2: any

describe('create', async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  it('should create a new ingredient', async () => {
    const ingredient = {
      ...fakeIngredient(),
      user: user.id,
    }
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
    ;[user] = await insertAll(db, 'user', [fakeUser()])
    await insertAll(db, 'ingredient', { ...ingredient, user: user.id })
  })

  it('should find ingredient by name', async () => {
    const foundIngredient = await repository.findByName(
      ingredient.name,
      user.id
    )

    expect(foundIngredient).toMatchObject({
      name: ingredient.name,
    })
  })

  it('should return nothing if ingredient is not found by name', async () => {
    const foundIngredient = await repository.findByName(
      'nonExistingINGR',
      user.id
    )

    expect(foundIngredient).toBeUndefined()
  })
})

describe('findById', () => {
  it("should find ingredient by it's ID", async () => {
    ;[user] = await insertAll(db, 'user', [fakeUser()])
    const [ingr1, ingr2] = await insertAll(db, 'ingredient', [
      { ...fakeIngredient(), user: user.id },
      { ...fakeIngredient(), user: user.id },
    ])

    const result = await repository.findByIngredientId(ingr1.id, user.id)
    expect(result?.name).toBe(ingr1.name)

    const result2 = await repository.findByIngredientId(ingr2.id, user.id)
    expect(result2?.name).toBe(ingr2.name)
  })

  it('should return nothing if ingredient is not found by id', async () => {
    ;[user] = await insertAll(db, 'user', [fakeUser()])
    await insertAll(db, 'ingredient', [
      { ...fakeIngredient(), user: user.id },
      { ...fakeIngredient(), user: user.id },
    ])

    const res = await repository.findByIngredientId(0, user.id)
    expect(res).toBeUndefined()
  })
})

describe('findAll', () => {
  beforeAll(async () => {
    ;[user] = await insertAll(db, 'user', [fakeUser()])
    ;[user2] = await insertAll(db, 'user', [fakeUser()])
    await insertAll(db, 'ingredient', { ...fakeIngredient(), user: user2.id })
  })

  it('should return empty array if there are no ingredients for that user', async () => {
    const ingredients = await repository.findAll(user.id)
    expect(ingredients).toStrictEqual([])
  })

  it('should find all ingredients for the user from the database', async () => {
    await insertAll(db, 'ingredient', [
      { ...fakeIngredient(), user: user.id },
      { ...fakeIngredient(), user: user.id },
      { ...fakeIngredient(), user: user.id },
    ])
    const ingredients = await repository.findAll(user.id)
    expect(ingredients).toHaveLength(3)
    const otherUserIngredients = await repository.findAll(user2.id)
    expect(otherUserIngredients).toHaveLength(1)
  })
})

describe('updateIngredient', async () => {
  const ingredient = {
    name: 'milk',
  }

  beforeAll(async () => {
    ;[user] = await insertAll(db, 'user', [fakeUser()])
    await insertAll(db, 'ingredient', { ...ingredient, user: user.id })
  })

  it('should update ingredient sucessfully', async () => {
    const updateData = {
      name: 'eggs',
    }

    await repository.updateIngredient('milk', user.id, updateData)
    const updatedIngredient = await repository.findByName('eggs', user.id)
    expect(updatedIngredient?.name).toBe('eggs')
  })

  it('should not update other ingredients if specific ingredient not found', async () => {
    const updateData = {
      name: 'flour',
    }

    await repository.updateIngredient('fdsaf', user.id, updateData)
    const existingIngredient = await repository.findByName(
      ingredient.name,
      user.id
    )
    expect(existingIngredient?.name).toBe(ingredient.name)
  })
})

describe('delete', () => {
  const ingredient = {
    name: 'banana',
  }
  beforeAll(async () => {
    ;[user] = await insertAll(db, 'user', [fakeUser()])
    await insertAll(db, 'ingredient', { ...ingredient, user: user.id })
  })

  it('should delete meal', async () => {
    const previousDB = await repository.findAll(user.id)
    expect(previousDB).toHaveLength(1)
    await repository.deleteIngredient('banana', user.id)
    const database = await repository.findAll(user.id)
    expect(database).toHaveLength(0)
  })

  it('should do nothing if meal was not found', async () => {
    await repository.deleteIngredient('fdsaf', user.id)
    const database = await repository.findAll(user.id)
    expect(database).toHaveLength(1)
    expect(database[0]).toMatchObject({
      name: ingredient.name,
    })
  })
})
