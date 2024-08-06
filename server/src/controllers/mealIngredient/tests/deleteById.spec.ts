// import { authContext } from '@tests/utils/context'
// import { createTestDatabase } from '@tests/utils/database'
// import { createCallerFactory } from '@server/trpc'
// import { wrapInRollbacks } from '@tests/utils/transactions'
// import { clearTables, insertAll } from '@tests/utils/records'
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

// beforeEach(async () => {
//   ;[user] = await insertAll(db, 'user', [fakeUser()])
//   ;[meal] = await insertAll(db, 'meal', [fakeMeal()])
// })

// describe('deleteById', () => {
//   it('should delete a meal ingredient successfully', async () => {
//     // arrange
//     const [meal1] = await insertAll(db, 'meal', [fakeMeal()])
//     const [ingredient1] = await insertAll(db, 'ingredient', [fakeIngredient()])

//     const [mealIngredient] = await insertAll(db, 'mealIngredient', [
//       {
//         mealId: meal1.id,
//         ingredientId: ingredient1.id,
//         quantity: 200,
//       },
//     ])
//     const { deleteById } = createCaller(authContext({ db }, user))

//     // act
//     await deleteById({ id: mealIngredient.id })
//     const remainingMealIngredients = await db
//       .selectFrom('mealIngredient')
//       .where('id', '=', mealIngredient.id)
//       .execute()

//     // assert
//     expect(remainingMealIngredients).toHaveLength(0)
//   })

//   it('should handle non-existent ID gracefully', async () => {
//     const { deleteById } = createCaller(authContext({ db }, user))
//     const result = await deleteById({ id: 999 })

//     expect(result).toBeUndefined()
//   })

//   it('prevents unauth user from using procedure', async () => {
//     const { deleteById } = createCaller({
//       db,
//       req: {
//         // no Auth header
//         header: () => undefined,
//       } as any,
//     })

//     await expect(
//       deleteById({
//         id: 2,
//       })
//     ).rejects.toThrowError(/unauthenticated/i)
//   })
// })
