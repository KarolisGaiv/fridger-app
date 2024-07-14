import { publicProcedure } from '@server/trpc'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { ingredientRepository } from '@server/repositories/ingredientRepository'
import { z } from 'zod'

export default publicProcedure
  .use(
    provideRepos({
      ingredientRepository,
    })
  )
  .input(
    z.object({
      ingredientToUpdate: z.string().min(1),
      newName: z.string().min(1),
    })
  )
  .mutation(
    async ({ input: { ingredientToUpdate, newName }, ctx: { repos } }) => {
      const ingredient =
        await repos.ingredientRepository.findByName(ingredientToUpdate)

      if (!ingredient) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Ingredient with this name was not found',
        })
      }

      const updatedIngredient =
        await repos.ingredientRepository.updateIngredient(ingredientToUpdate, {
          name: newName,
        })

      return updatedIngredient
    }
  )
