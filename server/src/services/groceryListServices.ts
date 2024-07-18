// import type {Database} from "@server/database"
// import { mealPlanRepository } from "@server/repositories/mealPlanRepository"
// import { GroceryListRepository } from "@server/repositories/groceryListRepository"
// import { mealIngredientRepository } from "@server/repositories/mealIngredientRepository"
// import { TRPCError } from "@trpc/server";

// export function groceryListServices(db: Database){
//     const mealPlanRepo = mealPlanRepository(db);
//     const mealIngredientRepo = mealIngredientRepository(db);
//     const groceryListRepo = groceryListRepository(db);

//     return {
//         async generateGroceryList(userId: number) {
//             // get user's meal plan
//             const mealPlans = await mealPlanRepo.findByUserId(userId)
//             if (mealPlans.length === 0) {
//                 throw new TRPCError({
//                     code: "NOT_FOUND",
//                     message: "No meal plan found for user"
//                 })
//             }
//             const mealPlanId = mealPlans[0].id

//             // get meal ingredients with their quantities by meal plan ID
//             const ingredients = await db
//                 .selectFrom("mealIngredient")


//             /*
//             this will be authenticated procedure
//             1. get user's meal plan id. authUser will contain userID. How to connect these things to get meal_plan id?
//             2. get meal ingredients with their quantities by meal_plan id. 
//             3. loop over received result from step 3 and return the list
//             */
//         }
//     }
// }