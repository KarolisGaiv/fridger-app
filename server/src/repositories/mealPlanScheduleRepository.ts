import type { Database } from '@server/database'

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
        .executeTakeFirst()

      if (!mealID) {
        throw new Error(`Meal with name "${mealName}" not found`)
      }

      // get meal plan id based on meal plan name
      const mealPlanID = await db
        .selectFrom('mealPlan')
        .select('id')
        .where('planName', '=', mealPlan)
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
        .execute()
      return data
    },

    async fetchPlannedMeals(planName: string) {
      // Step 1: Get meal plan ID based on meal plan name
      const mealPlanID = await db
        .selectFrom('mealPlan')
        .select('id')
        .where('planName', '=', planName)
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

    // async toggleCompletionStatus(mealId: number, userId: number) {
    //   const currentStatus = await db
    //     .selectFrom("mealPlanSchedule")
    //     .select("completed")
    //     .where("mealId", "=", mealId)
    //     .where("userId", "=", userId)
    //     .executeTakeFirst()

    //     const newStatus = !currentStatus?.completed

    //     await db
    //     .updateTable("mealPlanSchedule")
    //     .set({completed: newStatus})
    //     .where("mealId", "=", mealId)
    //     .where("userId", "=", userId)
    //     .execute()
    // },

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
  }
}
