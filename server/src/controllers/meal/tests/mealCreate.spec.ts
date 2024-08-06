// import { authContext } from '@tests/utils/context'
// import { createTestDatabase } from '@tests/utils/database'
// import { fakeMeal, fakeUser } from '@server/entities/tests/fakes'
// import { createCallerFactory } from '@server/trpc'
// import { wrapInRollbacks } from '@tests/utils/transactions'
// import { insertAll } from '@tests/utils/records'
// import mealRouter from '..'

// const db = await wrapInRollbacks(createTestDatabase())
// const createCaller = createCallerFactory(mealRouter)
// let user: any

// beforeEach(async () => {
//   ;[user] = await insertAll(db, 'user', [fakeUser()])
// })

// it('should create and save new meal', async () => {
//   // arrange
//   const meal = fakeMeal()
//   const { create } = createCaller(authContext({ db }, user))

//   // act
//   const response = await create(meal)

//   // assert
//   expect(response.mealCreated).toMatchObject({
//     name: meal.name,
//     calories: meal.calories,
//   })
// })

// it('prevents unauth user from using method', async () => {
//   // arrange
//   const { create } = createCaller({
//     db,
//     req: {
//       // no Auth header
//       header: () => undefined,
//     } as any,
//   })

//   // act & assert
//   await expect(create(fakeMeal())).rejects.toThrowError(/unauthenticated/i)
// })
