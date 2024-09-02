/* eslint-disable @typescript-eslint/no-unused-vars */
import { createTestDatabase } from '@tests/utils/database'
import { authContext } from '@tests/utils/context'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, selectAll } from '@tests/utils/records'
import {
  fakeUser,
  fakeMealPlan,
  fakeMeal,
  fakeIngredient,
  fakeMealIngredient,
} from '@server/entities/tests/fakes'
import groceryListRouter from '@server/controllers/groceryList'
import fridgeContentRouter from '..'

let user: any
let mealPlan: any
let meal: any
let ingredient: any

const db = await wrapInRollbacks(createTestDatabase())
const createFridgeCaller = createCallerFactory(fridgeContentRouter)
const createGroceryListCaller = createCallerFactory(groceryListRouter)

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
  ;[ingredient] = await insertAll(db, 'ingredient', {
    ...fakeIngredient(),
    user: user.id,
  })
})

it('decreases quantity of ingredient in the fridge when meal is completed', async () => {
  // arrange
  const mealIngredientData = {
    mealId: meal.id,
    ingredientId: ingredient.id,
    quantity: 200,
  }
  await insertAll(db, 'mealIngredient', mealIngredientData)

  const { generateGroceryList } = createGroceryListCaller(
    authContext({ db }, user)
  )
  const { populateFridge, updateQuantity } = createFridgeCaller(
    authContext({ db }, user)
  )

  await insertAll(db, 'mealPlanSchedule', {
    mealId: meal.id,
    mealPlanId: mealPlan.id,
    assignedDay: 2,
    type: 'dinner',
    userId: user.id,
  })
  await generateGroceryList({ planName: mealPlan.planName })
  await populateFridge({ planName: mealPlan.planName })
  const dataBefore = await selectAll(db, 'fridgeContent')

  expect(dataBefore[0].existingQuantity).toBe(mealIngredientData.quantity)

  // act
  await updateQuantity({ completed: true, mealName: meal.name })

  // assert
  const dataAfter = await selectAll(db, 'fridgeContent')

  expect(dataAfter[0].existingQuantity).not.toBe(mealIngredientData.quantity)
  expect(dataAfter[0].existingQuantity).toBe(0)

  // assert that when meal changes from completed to uncompleted quantity also changes
  await updateQuantity({ completed: false, mealName: meal.name })

  const dataAfterToggling = await selectAll(db, 'fridgeContent')
  expect(dataAfterToggling[0].existingQuantity).toBe(
    mealIngredientData.quantity
  )
})

it('does not allow to use method for unauth user', async () => {
  // arrange
  const { updateQuantity } = createFridgeCaller({
    db,
    req: {
      // no Auth header
      header: () => undefined,
    } as any,
  })

  // act & assert
  await expect(
    updateQuantity({ mealName: 'test', completed: false })
  ).rejects.toThrowError(/unauthenticated/i)
})
