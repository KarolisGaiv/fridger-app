// import { authContext } from '@tests/utils/context'
// import { createTestDatabase } from '@tests/utils/database'
// import { createCallerFactory } from '@server/trpc'
// import { wrapInRollbacks } from '@tests/utils/transactions'
// import { insertAll, clearTables } from '@tests/utils/records'
// import {
//   fakeMeal,
//   fakeIngredient,
//   fakeUser,
// } from '@server/entities/tests/fakes'
// import mealIngredientRouter from '..'

// const db = await wrapInRollbacks(createTestDatabase())
// const createCaller = createCallerFactory(mealIngredientRouter)
// let user: any
// let meal: any
// let ingredient1: any
// let ingredient2: any

// beforeEach(async () => {
//   await clearTables(db, ['meal', 'ingredient'])
//   ;[user] = await insertAll(db, 'user', [fakeUser()])
//   ;[meal] = await insertAll(db, 'meal', [fakeMeal()])
//   ;[ingredient1, ingredient2] = await insertAll(db, 'ingredient', [
//     fakeIngredient(),
//     fakeIngredient(),
//   ])
// })

// describe('findIngredientsByMealId', () => {
//   it('should find ingredients by meal ID', async () => {
//     // arrange
//     await insertAll(db, 'mealIngredient', [
//       { mealId: meal.id, ingredientId: ingredient1.id, quantity: 200 },
//       { mealId: meal.id, ingredientId: ingredient2.id, quantity: 300 },
//     ])

//     // act
//     const { findIngredientsByMealId } = createCaller(authContext({ db }, user))
//     const result = await findIngredientsByMealId({ mealId: meal.id })

//     // assert
//     expect(result).toHaveLength(2)
//     expect(result).toEqual(
//       expect.arrayContaining([
//         expect.objectContaining({
//           ingredientId: ingredient1.id,
//           quantity: 200,
//         }),
//         expect.objectContaining({
//           ingredientId: ingredient2.id,
//           quantity: 300,
//         }),
//       ])
//     )
//   })

//   it('should return empty array if no ingredients found for meal', async () => {
//     const [meal1] = await insertAll(db, 'meal', [fakeMeal()])

//     const { findIngredientsByMealId } = createCaller(authContext({ db }, user))
//     const result = await findIngredientsByMealId({ mealId: meal1.id })

//     expect(result).toHaveLength(0)
//     expect(result).toStrictEqual([])
//   })

//   it('should throw error for meal which does not exist', async () => {
//     const { findIngredientsByMealId } = createCaller(authContext({ db }, user))
//     await expect(
//       findIngredientsByMealId({ mealId: 498489 })
//     ).rejects.toThrowError(/meal does not exist/i)
//   })

//   it('prevents unauth user from using procedure', async () => {
//     // arrange
//     const { findIngredientsByMealId } = createCaller({
//       db,
//       req: {
//         // no Auth header
//         header: () => undefined,
//       } as any,
//     })

//     // act & assert
//     await expect(findIngredientsByMealId({ mealId: 2 })).rejects.toThrowError(
//       /unauthenticated/i
//     )
//   })
// })
