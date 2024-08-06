// import { authContext } from '@tests/utils/context'
// import { createTestDatabase } from '@tests/utils/database'
// import { createCallerFactory } from '@server/trpc'
// import { wrapInRollbacks } from '@tests/utils/transactions'
// import { insertAll, selectAll } from '@tests/utils/records'
// import {
//   fakeUser,
//   fakeMealPlan,
//   fakeIngredient,
// } from '@server/entities/tests/fakes'
// import groceryListRouter from '..'

// let user: any
// let mealPlan: any
// let ingredient: any

// const db = await wrapInRollbacks(createTestDatabase())
// const createCaller = createCallerFactory(groceryListRouter)

// beforeAll(async () => {
//   ;[user] = await insertAll(db, 'user', [fakeUser()])
//   ;[mealPlan] = await insertAll(db, 'mealPlan', [
//     fakeMealPlan({ userId: user.id }),
//   ])
//   ;[ingredient] = await insertAll(db, 'ingredient', fakeIngredient())
// })

// describe('create', () => {
//   it('should create a new grocery list item', async () => {
//     // arrange
//     const newGroceryList = {
//       mealPlanId: mealPlan.id,
//       product: 'Apples',
//       quantity: 5,
//       ingredientId: ingredient.id,
//     }
//     const { create } = createCaller(authContext({ db }, user))

//     // act
//     const result = await create(newGroceryList)

//     // assert
//     expect(result).toEqual({
//       result: [
//         expect.objectContaining({
//           mealPlanId: mealPlan.id,
//           product: 'Apples',
//           quantity: 5,
//         }),
//       ],
//     })
//   })

//   it('prevents unauth user from using method', async () => {
//     // arrange
//     const { create } = createCaller({
//       db,
//       req: {
//         // no Auth header
//         header: () => undefined,
//       } as any,
//     })

//     const newGroceryList = {
//       mealPlanId: mealPlan.id,
//       product: 'Apples',
//       quantity: 5,
//       ingredientId: ingredient.id,
//     }

//     // act & assert
//     await expect(create(newGroceryList)).rejects.toThrowError(
//       /unauthenticated/i
//     )
//   })
// })
