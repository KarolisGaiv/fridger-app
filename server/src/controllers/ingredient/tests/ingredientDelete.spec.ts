import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, clearTables, selectAll } from '@tests/utils/records'
import ingredientRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(ingredientRouter)
const { deleteIngredient } = createCaller({ db })

beforeEach(async () => {
  await clearTables(db, ['ingredient'])
})

it('should throw error if ingredient to delete is not found', async () => {
  await expect(
    deleteIngredient({ name: 'non-existing-ingredient' })
  ).rejects.toThrowError()

  await insertAll(db, 'ingredient', { name: 'egg' })
  await expect(
    deleteIngredient({ name: 'non-existing-meal' })
  ).rejects.toThrowError()
})

it('should delete ingredient', async () => {
  await insertAll(db, 'ingredient', { name: 'egg' })
  let ingredients = await selectAll(db, 'ingredient')
  expect(ingredients).toHaveLength(1)

  await expect(deleteIngredient({ name: 'egg' })).resolves.not.toThrowError()
  ingredients = await selectAll(db, 'ingredient')
  expect(ingredients).toHaveLength(0)
})
