/* eslint-disable @typescript-eslint/no-unused-vars */
import { createTestDatabase } from '@tests/utils/database'
import { authContext } from '@tests/utils/context'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import {
  fakeUser,
  fakeMealPlan,
  fakeMeal,
  fakeIngredient,
  fakeMealIngredient,
} from '@server/entities/tests/fakes'
import groceryListRouter from '..'

let user: any
let mealPlan: any
let meal1: any
let meal2: any
let meal3: any
let ingredient1: any
let ingredient2: any
let ingredient3: any
let ingredient4: any
let fakeMealIngr1: any
let fakeMealIngr2: any
let fakeMealIngr3: any
let fakeMealIngr4: any

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(groceryListRouter)

beforeAll(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  ;[mealPlan] = await insertAll(db, 'mealPlan', [
    fakeMealPlan({ userId: user.id }),
  ])
  ;[meal1] = await insertAll(db, 'meal', {
    ...fakeMeal(),
    user: user.id,
    mealPlan: mealPlan.id,
  })
  ;[meal2] = await insertAll(db, 'meal', {
    ...fakeMeal(),
    user: user.id,
    mealPlan: mealPlan.id,
  })
  ;[meal3] = await insertAll(db, 'meal', {
    ...fakeMeal(),
    user: user.id,
    mealPlan: mealPlan.id,
  })
  ;[ingredient1] = await insertAll(db, 'ingredient', {
    ...fakeIngredient(),
    user: user.id,
  })
  ;[ingredient2] = await insertAll(db, 'ingredient', {
    ...fakeIngredient(),
    user: user.id,
  })
  ;[ingredient3] = await insertAll(db, 'ingredient', {
    ...fakeIngredient(),
    user: user.id,
  })
  ;[ingredient4] = await insertAll(db, 'ingredient', {
    ...fakeIngredient(),
    user: user.id,
  })
  ;[fakeMealIngr1] = await insertAll(db, 'mealIngredient', [
    fakeMealIngredient({
      mealId: meal1.id,
      ingredientId: ingredient1.id,
      mealPlan: mealPlan.id,
    }),
  ])
  ;[fakeMealIngr2] = await insertAll(db, 'mealIngredient', [
    fakeMealIngredient({
      mealId: meal1.id,
      ingredientId: ingredient2.id,
      mealPlan: mealPlan.id,
    }),
  ])
  ;[fakeMealIngr3] = await insertAll(db, 'mealIngredient', [
    fakeMealIngredient({
      mealId: meal1.id,
      ingredientId: ingredient3.id,
      mealPlan: mealPlan.id,
    }),
  ])
  ;[fakeMealIngr4] = await insertAll(db, 'mealIngredient', [
    fakeMealIngredient({
      mealId: meal2.id,
      ingredientId: ingredient4.id,
      mealPlan: mealPlan.id,
    }),
  ])
})

describe('generateGroceryList', () => {
  it('should generate grocery list based on meal plan ingredients', async () => {
    // arrange
    const { generateGroceryList } = createCaller(authContext({ db }, user))

    await insertAll(db, 'mealPlanSchedule', [
      {
        mealId: meal1.id,
        mealPlanId: mealPlan.id,
        assignedDay: 2,
        type: 'dinner',
        userId: user.id,
      },
      {
        mealId: meal2.id,
        mealPlanId: mealPlan.id,
        assignedDay: 2,
        type: 'dinner',
        userId: user.id,
      },
      {
        mealId: meal3.id,
        mealPlanId: mealPlan.id,
        assignedDay: 2,
        type: 'dinner',
        userId: user.id,
      },
    ])

    // act
    const res = await generateGroceryList({ planName: mealPlan.planName })
    // // assert
    expect(res).toBeDefined()
    expect(res).toHaveLength(4)
  })

  it('prevents unauth user from using method', async () => {
    // arrange
    const { generateGroceryList } = createCaller({
      db,
      req: {
        // no Auth header
        header: () => undefined,
      } as any,
    })

    // act & assert
    await expect(
      generateGroceryList({ planName: 'testing' })
    ).rejects.toThrowError(/unauthenticated/i)
  })
})
