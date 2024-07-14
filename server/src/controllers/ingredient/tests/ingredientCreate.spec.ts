import { createTestDatabase } from '@tests/utils/database'
import { fakeIngredient } from '@server/entities/tests/fakes'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { selectAll } from '@tests/utils/records'
import ingredientRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(ingredientRouter)
const { create } = createCaller({ db })

it('should create and save new ingredient', async () => {
  const ingredient = fakeIngredient()
  const res = await create(ingredient)

  const [ingredientCreated] = await selectAll(db, 'ingredient', (query) =>
    query('name', '=', ingredient.name)
  )

  expect(ingredientCreated).toMatchObject({
    id: expect.any(Number),
    ...ingredient,
  })

  expect(res.ingredientCreated).toEqual({
    name: ingredientCreated.name,
  })
})
