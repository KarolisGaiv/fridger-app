import { createTestDatabase } from '@tests/utils/database'
import {
  fakeMeal,
  fakeIngredient,
  fakeMealPlan,
  fakeUser,
  fakeMealIngredient,
} from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { fridgeContentService } from '@server/services/fridgeContentServices'
import { insertAll, clearTables, selectAll } from '@tests/utils/records'
import { groceryListServices } from '@server/services/groceryListServices'

const db = await wrapInRollbacks(createTestDatabase())
const groceryService = groceryListServices(db)
const fridgeService = fridgeContentService(db)

let user: any
let activeMealPlan: any
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let inactiveMealPlan: any
let meal1: any
let ingredient1: any
let ingredient2: any

// beforeAll(async () => {
//   // // await clearTables(db, [
//     'mealIngredient',
//     'meal',
//     'ingredient',
//     'mealPlan',
//     'user',
//     'fridgeContent',
//   ])
// })

beforeEach(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  ;[activeMealPlan, inactiveMealPlan] = await insertAll(db, 'mealPlan', [
    fakeMealPlan({ userId: user.id, isActive: true }),
    fakeMealPlan({ userId: user.id, isActive: false }),
  ])
  ;[meal1] = await insertAll(db, 'meal', [fakeMeal()])
  ;[ingredient1, ingredient2] = await insertAll(db, 'ingredient', [
    fakeIngredient({ name: 'eggs' }),
    fakeIngredient({ name: 'bacon' }),
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

it('should generate fridge content based on grocery list', async () => {
  // arrange
  const groceryList = await groceryService.generateGroceryList(user.id)
  await insertAll(db, 'groceryList', groceryList)
  const oldFridgeContent = await selectAll(db, 'fridgeContent')

  // act
  await fridgeService.placeItemsIntoFridge(user.id)
  const fridgeContents = await selectAll(db, 'fridgeContent')

  // assert
  expect(fridgeContents).toHaveLength(2)
  expect(fridgeContents.length).toBeGreaterThan(oldFridgeContent.length)
})
