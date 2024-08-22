import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { ingredientRepository } from '@server/repositories/ingredientRepository'
import { ingredientSchema } from '@server/entities/ingredient'

export default authenticatedProcedure
  .use(
    provideRepos({
      ingredientRepository,
    })
  )
  .input(
    ingredientSchema.pick({
      id: true,
    })
  )
  .query(async ({ input, ctx: { authUser, repos } }) => {
    const ingredient = await repos.ingredientRepository.findByIngredientId(
      input.id,
      authUser.id
    )

    if (!ingredient) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Ingredient with this id not found',
      })
    }

    return ingredient
  })
