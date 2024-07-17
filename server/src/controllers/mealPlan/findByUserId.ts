import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
import { publicProcedure } from '@server/trpc'
import { TRPCError } from '@trpc/server'
import provideRepos from '@server/trpc/provideRepos'
import { mealPlanRepository } from '@server/repositories/mealPlanRepository'
import { mealPlanSchema } from '@server/entities/mealPlan'

// export default publicProcedure
//   .use(
//     provideRepos({
//       mealPlanRepository,
//     })
//   )
//   .input(mealPlanSchema.pick({ userId: true }))
//   .query(async ({ input: { userId }, ctx: { repos } }) => {
//     const mealPlans = await repos.mealPlanRepository.findByUserId(userId)

//     if (mealPlans.length === 0) {
//       throw new TRPCError({
//         code: 'NOT_FOUND',
//         message: 'No meal plans found for this user',
//       })
//     }

//     return mealPlans
//   })

export default authenticatedProcedure
  .use(
    provideRepos({
      mealPlanRepository,
    })
  )
  .query(async ({ ctx: { authUser, repos } }) => {
    const mealPlans = await repos.mealPlanRepository.findByUserId(authUser.id)
    return mealPlans
  })
