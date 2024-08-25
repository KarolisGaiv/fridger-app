import type { Database } from '@server/database'
import type { MealPlanSchedule } from '@server/database/types'

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

      const data: MealPlanSchedule = {
        mealId: mealID.id,
        mealPlanId: mealPlanID.id,
        userId,
        assignedDay,
        type,
      }

      await db
        .insertInto('mealPlanSchedule')
        .values(data)
        .executeTakeFirstOrThrow()
    },
  }
}
