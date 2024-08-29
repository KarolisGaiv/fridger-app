import type { Database } from '@server/database'
import { sql } from 'kysely'

export function mealPlanScheduleRepository(db: Database) {
  return {
    async create(
      mealName: string,
      mealPlan: string,
      assignedDay: number,
      type: string,
      userId: number
    ) {
      // get meal id based on meal name
      const mealID = await db
        .selectFrom('meal')
        .select('id')
        .where('name', '=', mealName)
        .where('user', '=', userId)
        .executeTakeFirst()

      if (!mealID) {
        throw new Error(`Meal with name "${mealName}" not found`)
      }

      // get meal plan id based on meal plan name
      const mealPlanID = await db
        .selectFrom('mealPlan')
        .select('id')
        .where('planName', '=', mealPlan)
        .where('userId', '=', userId)
        .executeTakeFirst()

      if (!mealPlanID) {
        throw new Error(`Meal Plan with name "${mealPlan}" not found`)
      }

      const data = {
        mealId: mealID.id,
        mealPlanId: mealPlanID.id,
        userId,
        assignedDay,
        type,
        completed: false,
      }

      await db
        .insertInto('mealPlanSchedule')
        .values(data)
        .executeTakeFirstOrThrow()
    },

    async findMealsByPlan(planId: number) {
      const data = await db
        .selectFrom('mealPlanSchedule')
        .select('mealId')
        .where('mealPlanId', '=', planId)
        .where('completed', '=', false)
        .execute()
      return data
    },

    async fetchPlannedMeals(planName: string, userId: number) {
      // Step 1: Get meal plan ID based on meal plan name
      const mealPlanID = await db
        .selectFrom('mealPlan')
        .select('id')
        .where('planName', '=', planName)
        .where('userId', '=', userId)
        .executeTakeFirst()

      if (!mealPlanID) {
        throw new Error(`Meal Plan with name "${planName}" not found`)
      }

      // Step 2: Fetch meals with details
      const meals = await db
        .selectFrom('mealPlanSchedule')
        .innerJoin('meal', 'meal.id', 'mealPlanSchedule.mealId')
        .select([
          'meal.name',
          'meal.calories',
          'mealPlanSchedule.type',
          'mealPlanSchedule.assignedDay',
          'mealPlanSchedule.completed',
        ])
        .where('mealPlanSchedule.mealPlanId', '=', mealPlanID.id)
        .execute()

      // Step 3: Format the data
      const formattedMeals = meals.map((meal) => ({
        name: meal.name,
        calories: meal.calories,
        type: meal.type,
        assignedDay: meal.assignedDay,
        completed: meal.completed,
      }))

      return formattedMeals
    },

    async toggleCompletionStatus(
      mealName: string,
      assignedDay: number,
      type: string,
      userId: number
    ) {
      const currentStatus = await db
        .selectFrom('mealPlanSchedule')
        .innerJoin('meal', 'meal.id', 'mealPlanSchedule.mealId')
        .select(['mealPlanSchedule.mealId', 'mealPlanSchedule.completed'])
        .where('meal.name', '=', mealName)
        .where('mealPlanSchedule.assignedDay', '=', assignedDay)
        .where('mealPlanSchedule.type', '=', type)
        .where('meal.user', '=', userId)
        .where('mealPlanSchedule.userId', '=', userId)
        .executeTakeFirst()

      if (!currentStatus) {
        throw new Error(
          'Meal not found or not part of an active meal plan for this user'
        )
      }
      const newStatus = !currentStatus?.completed

      await db
        .updateTable('mealPlanSchedule')
        .set({ completed: newStatus })
        .where('mealId', '=', currentStatus.mealId)
        .where('assignedDay', '=', assignedDay)
        .where('type', '=', type)
        .where('userId', '=', userId)
        .execute()
    },

    async removeMealFromPlan(
      mealName: string,
      planName: string,
      userId: number,
      assignedDay: number,
      type: string
    ) {
      const mealID = await db
        .selectFrom('meal')
        .select('id')
        .where('name', '=', mealName)
        .where('user', '=', userId)
        .executeTakeFirst()

      const mealPlanID = await db
        .selectFrom('mealPlan')
        .select('id')
        .where('planName', '=', planName)
        .where('userId', '=', userId)
        .executeTakeFirst()

      // remove the meal from the mealPlanSchedule
      await db
        .deleteFrom('mealPlanSchedule')
        .where('mealId', '=', mealID!.id)
        .where('mealPlanId', '=', mealPlanID!.id)
        .where('assignedDay', '=', assignedDay)
        .where('type', '=', type)
        .where('userId', '=', userId)
        .execute()

      // Adjust the grocery list
      await db
        .updateTable('groceryList')
        .set({
          quantity: sql`quantity - (SELECT quantity FROM meal_ingredient WHERE meal_ingredient.meal_id = ${mealID!.id} AND meal_ingredient.ingredient_id = grocery_list.ingredient_id)`,
        })
        .where('mealPlanId', '=', mealPlanID!.id)
        .where('quantity', '>', 0)
        .execute()

      // Remove any ingredients from the grocery list where quantity is now zero
      await db
        .deleteFrom('groceryList')
        .where('mealPlanId', '=', mealPlanID!.id)
        .where('quantity', '=', 0)
        .execute()

      // await db.selectFrom('fridgeContent').where('existingQuantity')

      // adjust frindge content
      await db
        .updateTable('fridgeContent')
        .set({
          existingQuantity: sql`existing_quantity - (SELECT quantity FROM meal_ingredient WHERE meal_ingredient.meal_id = ${mealID!.id} AND meal_ingredient.ingredient_id = fridge_content.ingredient_id AND fridge_content.user_id = ${userId})`,
        })
        .where('mealPlan', '=', mealPlanID!.id)
        .where('userId', '=', userId)
        .where('existingQuantity', '>', 0)
        .execute()

      // Remove any fridge content where existing quantity is now zero
      await db
        .deleteFrom('fridgeContent')
        .where('mealPlan', '=', mealPlanID!.id)
        .where('userId', '=', userId)
        .where('existingQuantity', '=', 0)
        .execute()

      // Adjust the fridge content
      // await db
      //   .updateTable('fridgeContent')
      //   .set({
      //     reservedQuantity: sql`reservedQuantity - (SELECT quantity FROM mealIngredient WHERE mealIngredient.mealId = ${mealID!.id} AND mealIngredient.ingredientId = fridgeContent.ingredientId)`,
      //   })
      //   .where('userId', '=', userId)
      //   .where('reservedQuantity', '>', 0)
      //   .execute();

      // Remove any fridge content where reserved quantity is now zero
      // await db
      // .deleteFrom('fridgeContent')
      // .where('userId', '=', userId)
      // .where('reservedQuantity', '=', 0)
      // .execute();
    },
  }
}
