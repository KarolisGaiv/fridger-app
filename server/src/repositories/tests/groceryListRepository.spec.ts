import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import {
  fakeMealPlan,
  fakeUser,
  fakeIngredient,
  fakeMeal,
} from '@server/entities/tests/fakes'
import { insertAll } from '@tests/utils/records'
import { groceryListRepository } from '../groceryListRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = groceryListRepository(db)
let user: any
let mealPlan: any
let meal: any
let fakeIngr: any

async function createFakeGroceryList() {
  const list = {
    mealPlanId: mealPlan.id,
    product: 'snake oil',
    quantity: 30,
    ingredientId: fakeIngr.id,
  }
  const [data] = await insertAll(db, 'groceryList', [list])
  return data.id
}

beforeAll(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  ;[mealPlan] = await insertAll(db, 'mealPlan', [
    fakeMealPlan({ userId: user.id }),
  ])
  ;[meal] = await insertAll(db, 'meal', {
    ...fakeMeal(),
    user: user.id,
    mealPlan: mealPlan.id,
  })
  ;[fakeIngr] = await insertAll(db, 'ingredient', {
    ...fakeIngredient(),
    user: user.id,
  })

  await insertAll(db, 'mealIngredient', {
    quantity: 43,
    ingredientId: fakeIngr.id,
    mealId: meal.id,
    mealPlan: mealPlan.id,
  })
})

describe('create', () => {
  it('should create a new grocery list item', async () => {
    // arrange
    const newGroceryList = {
      mealPlanId: mealPlan.id,
      product: 'Apples',
      quantity: 5,
      ingredientId: fakeIngr.id,
    }

    // act
    const [createdGroceryList] = await repository.create([newGroceryList])

    // assert
    expect(createdGroceryList).toEqual(newGroceryList)
  })
})

describe('findById', () => {
  it('should retrieve a grocery list item by ID', async () => {
    const fakeListId = await createFakeGroceryList()
    const foundGroceryList = await repository.findById(fakeListId)
    expect(foundGroceryList).toEqual(
      expect.objectContaining({
        product: 'snake oil',
        quantity: 30,
      })
    )
  })

  it('should return undefined for non-existent ID', async () => {
    const nonExistentId = 999 // Assuming 999 does not exist in test data
    const foundGroceryList = await repository.findById(nonExistentId)
    expect(foundGroceryList).toBeUndefined()
  })
})

describe('findByMealPlanId', () => {
  it('should retrieve all grocery list items by meal plan ID', async () => {
    const groceryListItems = [
      {
        mealPlanId: mealPlan.id,
        product: 'Apples',
        quantity: 5,
        ingredientId: fakeIngr.id,
      },
      {
        mealPlanId: mealPlan.id,
        product: 'Bananas',
        quantity: 10,
        ingredientId: fakeIngr.id,
      },
    ]

    await insertAll(db, 'groceryList', groceryListItems)
    const foundGroceryLists = await repository.findByMealPlanId(mealPlan.id)

    expect(foundGroceryLists).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          mealPlanId: mealPlan.id,
          product: 'Apples',
          quantity: 5,
        }),
        expect.objectContaining({
          mealPlanId: mealPlan.id,
          product: 'Bananas',
          quantity: 10,
        }),
      ])
    )
  })

  it('should return an empty array for a meal plan ID with no grocery list items', async () => {
    const anotherMealPlan = await insertAll(db, 'mealPlan', [
      fakeMealPlan({ userId: user.id }),
    ])

    const foundGroceryLists = await repository.findByMealPlanId(
      anotherMealPlan[0].id
    )

    expect(foundGroceryLists).toEqual([])
  })
})

describe('update', () => {
  it('should update a grocery list item', async () => {
    const fakeListId = await createFakeGroceryList()
    const updates = { product: 'Updated Product', quantity: 99 }

    const updatedGroceryList = await repository.update(fakeListId, updates)

    expect(updatedGroceryList).toEqual(expect.objectContaining(updates))
  })

  it('should return undefined for non-existent grocery list item ID', async () => {
    const nonExistentId = 999 // Assuming 999 does not exist in test data
    const updates = { product: 'Updated Product', quantity: 99 }

    const updatedGroceryList = await repository.update(nonExistentId, updates)

    expect(updatedGroceryList).toBeUndefined()
  })
})

describe('deleteById', () => {
  it('should delete a grocery list item by ID', async () => {
    const fakeListId = await createFakeGroceryList()
    await repository.deleteById(fakeListId)

    const foundGroceryList = await repository.findById(fakeListId)
    expect(foundGroceryList).toBeUndefined()
  })

  it('should not throw an error when deleting a non-existent ID', async () => {
    const nonExistentId = 999 // Assuming 999 does not exist in test data
    await expect(repository.deleteById(nonExistentId)).resolves.not.toThrow()
  })
})
