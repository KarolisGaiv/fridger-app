// import { authenticatedProcedure } from '@server/trpc/authenticateProcedure'
// import { TRPCError } from '@trpc/server'
// import provideRepos from '@server/trpc/provideRepos'
// import { mealRepository } from '@server/repositories/mealRepository'
// import { mealPlanRepository } from '@server/repositories/mealPlanRepository'
// import { mealSchema } from '@server/entities/meal'

// export default authenticatedProcedure
//   .use(
//     provideRepos({
//       mealRepository,
//       mealPlanRepository,
//     })
//   )
//   .input(mealSchema.pick({name: true}))
//   .query(async({input, ctx: {authUser, repos}}) => {
//     const mealPlan = await repos.mealPlanRepository.findActiveMealPlan(authUser.id)

//     await repos.mealRepository.toggleCompletionStatus(input.name, mealPlan, authUser.id)

//   })
