import { createTestDatabase } from '@tests/utils/database'
import {
  fakeMeal,
  fakeMealPlan,
  fakeUser,
  fakeMealIngredient,
} from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { fridgeContentService } from '@server/services/fridgeContentServices'
import { insertAll, selectAll } from '@tests/utils/records'
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

beforeAll(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  ;[activeMealPlan, inactiveMealPlan] = await insertAll(db, 'mealPlan', [
    fakeMealPlan({ userId: user.id, isActive: true }),
    fakeMealPlan({ userId: user.id, isActive: false }),
  ])
  ;[meal1] = await insertAll(db, 'meal', {
    ...fakeMeal(),
    user: user.id,
    mealPlan: activeMealPlan.id,
  })
  ;[ingredient1, ingredient2] = await insertAll(db, 'ingredient', [
    { name: 'eggs', user: user.id },
    { name: 'bacon', user: user.id },
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
  const plannedMeals = [
    {
      mealId: meal1.id,
    },
  ]

  // Generate the grocery list
  const groceryList = await groceryService.generateGroceryList(plannedMeals)

  // Insert each grocery item with the active meal plan ID
  await Promise.all(
    groceryList.map((item) =>
      insertAll(db, 'groceryList', {
        mealPlanId: activeMealPlan.id, // Ensure the meal plan ID is linked
        ingredientId: item.ingredientId,
        quantity: item.quantity,
        product: item.product,
      })
    )
  )

  // Fetch and verify the initial state of fridge contents
  const oldFridgeContent = await selectAll(db, 'fridgeContent')

  // act
  await fridgeService.placeItemsIntoFridge(activeMealPlan.planName, user.id)
  const fridgeContents = await selectAll(db, 'fridgeContent')

  // assert
  expect(fridgeContents).toHaveLength(2)
  expect(fridgeContents.length).toBeGreaterThan(oldFridgeContent.length)
})
