import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import { groceryListRepository } from '@server/repositories/groceryListRepository'
import { groceryListSchema } from '@server/entities/groceryList'

export default publicProcedure
  .use(
    provideRepos({
      groceryListRepository,
    })
  )
  .input(groceryListSchema.pick({ id: true }))
  .mutation(async ({ input: { id }, ctx: { repos } }) => {
    await repos.groceryListRepository.deleteById(id)
  })
