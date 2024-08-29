import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import { generateAIMealBy } from '@server/services/aiBot'
import { mealSchema } from '@server/entities/meal'

export default authenticatedProcedure
  .input(mealSchema.pick({ type: true, calories: true }))
  .query(async ({ input, ctx: { authUser } }) => {
    const { type, calories } = input

    const result = await generateAIMealBy(type!, calories)
    return result.meals[0]
  })
