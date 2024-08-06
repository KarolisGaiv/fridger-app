// import { authContext } from '@tests/utils/context'
// import { createTestDatabase } from '@tests/utils/database'
// import { createCallerFactory } from '@server/trpc'
// import { wrapInRollbacks } from '@tests/utils/transactions'
// import { insertAll, selectAll } from '@tests/utils/records'
// import { fakeUser } from '@server/entities/tests/fakes'
// import ingredientRouter from '..'

// const db = await wrapInRollbacks(createTestDatabase())
// const createCaller = createCallerFactory(ingredientRouter)
// let user: any

// beforeEach(async () => {
//   ;[user] = await insertAll(db, 'user', [fakeUser()])
// })

// it('should throw error if ingredient to delete is not found', async () => {
//   // arrange
//   const { deleteIngredient } = createCaller(authContext({ db }, user))

//   // act & assert
//   await expect(
//     deleteIngredient({ name: 'non-existing-ingredient' })
//   ).rejects.toThrowError()

//   await insertAll(db, 'ingredient', { name: 'egg' })
//   await expect(
//     deleteIngredient({ name: 'non-existing-meal' })
//   ).rejects.toThrowError()
// })

// it('should delete ingredient', async () => {
//   const { deleteIngredient } = createCaller(authContext({ db }, user))
//   await insertAll(db, 'ingredient', { name: 'egg' })

//   let ingredients = await selectAll(db, 'ingredient')
//   expect(ingredients).toHaveLength(1)

//   await expect(deleteIngredient({ name: 'egg' })).resolves.not.toThrowError()
//   ingredients = await selectAll(db, 'ingredient')
//   expect(ingredients).toHaveLength(0)
// })

// it('prevents unauth user from using method', async () => {
//   // arrange
//   const { deleteIngredient } = createCaller({
//     db,
//     req: {
//       // no Auth header
//       header: () => undefined,
//     } as any,
//   })

//   // act & assert
//   await expect(deleteIngredient({ name: 'eggs' })).rejects.toThrowError(
//     /Unauthenticated/i
//   )
// })
