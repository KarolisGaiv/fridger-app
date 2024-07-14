import { publicProcedure } from '@server/trpc'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { ingredientRepository } from '@server/repositories/ingredientRepository'
import { ingredientSchema } from '@server/entities/ingredient'

export default publicProcedure
  .use(
    provideRepos({
      ingredientRepository,
    })
  )
  .input(
    ingredientSchema.pick({
      name: true,
    })
  )
  .mutation(async ({ input, ctx: { repos } }) => {
    const ingredient = await repos.ingredientRepository.findByName(input.name)

    if (!ingredient) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Ingredient with this name not found',
      })
    }

    await repos.ingredientRepository.deleteIngredient(input.name)
  })
