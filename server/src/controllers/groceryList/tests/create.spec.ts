import { authContext } from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import {
  fakeUser,
  fakeMealPlan,
  fakeIngredient,
} from '@server/entities/tests/fakes'
import groceryListRouter from '..'

let user: any
let mealPlan: any
let ingredient: any

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(groceryListRouter)

beforeAll(async () => {
  ;[user] = await insertAll(db, 'user', [fakeUser()])
  ;[mealPlan] = await insertAll(db, 'mealPlan', [
    fakeMealPlan({ userId: user.id }),
  ])
  ;[ingredient] = await insertAll(db, 'ingredient', {...fakeIngredient(), user: user.id})
})

describe('create', () => {
  it('should create new grocery list items', async () => {
    // arrange
    const newGroceryList = [
      {
        mealPlanId: mealPlan.id,
        product: 'Apples',
        quantity: 5,
        ingredientId: ingredient.id,
      },
      {
        mealPlanId: mealPlan.id,
        product: 'Bananas',
        quantity: 3,
        ingredientId: ingredient.id,
      },
      {
        mealPlanId: mealPlan.id,
        product: 'Carrots',
        quantity: 7,
        ingredientId: ingredient.id,
      },
    ]
    const { create } = createCaller(authContext({ db }, user))

    // act
    const result = await create(newGroceryList)

    // assert
    expect(result).toEqual({
      result: newGroceryList.map((item) => expect.objectContaining(item)),
    })

    // Assert that each item in the result array is an object
    result.result.forEach((item) => {
      expect(typeof item).toBe('object')
      expect(item).toEqual(
        expect.objectContaining({
          mealPlanId: expect.any(Number),
          product: expect.any(String),
          quantity: expect.any(Number),
          ingredientId: expect.any(Number),
        })
      )
    })
  })

  it('prevents unauth user from using method', async () => {
    // arrange
    const { create } = createCaller({
      db,
      req: {
        // no Auth header
        header: () => undefined,
      } as any,
    })

    const newGroceryList = [
      {
        mealPlanId: mealPlan.id,
        product: 'Apples',
        quantity: 5,
        ingredientId: ingredient.id,
      },
      {
        mealPlanId: mealPlan.id,
        product: 'Bananas',
        quantity: 3,
        ingredientId: ingredient.id,
      },
      {
        mealPlanId: mealPlan.id,
        product: 'Carrots',
        quantity: 7,
        ingredientId: ingredient.id,
      },
    ]

    // act & assert
    await expect(create(newGroceryList)).rejects.toThrowError(
      /unauthenticated/i
    )
  })
})
