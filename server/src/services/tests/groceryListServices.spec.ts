import { createTestDatabase } from '@tests/utils/database'
import {
  fakeMeal,
  fakeIngredient,
  fakeMealPlan,
  fakeUser,
  fakeMealIngredient,
} from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables } from '@tests/utils/records'
import { groceryListServices } from '@server/services/groceryListServices'

const db = await wrapInRollbacks(createTestDatabase())
const service = groceryListServices(db)
let user: any
let activeMealPlan: any
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let inactiveMealPlan: any
let meal1: any
let ingredient1: any
let ingredient2: any

beforeAll(async () => {
  await clearTables(db, [
    'mealIngredient',
    'meal',
    'ingredient',
    'mealPlan',
    'user',
  ])
})

beforeEach(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  ;[activeMealPlan, inactiveMealPlan] = await insertAll(db, 'mealPlan', [
    fakeMealPlan({ userId: user.id, isActive: true }),
    fakeMealPlan({ userId: user.id, isActive: false }),
  ])
  ;[meal1] = await insertAll(db, 'meal', [fakeMeal()])
  ;[ingredient1, ingredient2] = await insertAll(db, 'ingredient', [
    fakeIngredient(),
    fakeIngredient(),
  ])

  await insertAll(db, 'mealIngredient', [
    fakeMealIngredient({
      mealId: meal1.id,
      ingredientId: ingredient1.id,
      quantity: 200,
      mealPlan: activeMealPlan.id,
    }),
    fakeMealIngredient({
      mealId: meal1.id,
      ingredientId: ingredient2.id,
      quantity: 300,
      mealPlan: activeMealPlan.id,
    }),
  ])
})

it('should generate a grocery list for the user based on the active meal plan', async () => {
  const groceryList = await service.generateGroceryList(user.id)

  expect(groceryList).toHaveLength(2)
  expect(groceryList).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        ingredientId: ingredient1.id,
        quantity: 200,
      }),
      expect.objectContaining({
        ingredientId: ingredient2.id,
        quantity: 300,
      }),
    ])
  )
})

it('should throw an error if no active meal plan is found for the user', async () => {
  await clearTables(db, ['mealPlan'])
  await insertAll(db, 'mealPlan', [
    fakeMealPlan({ userId: user.id, isActive: false }),
  ])

  await expect(service.generateGroceryList(user.id)).rejects.toThrow(
    /no active meal plan/i
  )
})

it('should handle no ingredients found gracefully', async () => {
  await clearTables(db, ['mealIngredient'])

  const groceryList = await service.generateGroceryList(user.id)

  expect(groceryList).toHaveLength(0)
})
