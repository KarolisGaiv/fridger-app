import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable('meal_plan_schedule')
    .dropConstraint('unique_meal_plan_schedule')
    .execute()

  await db.schema
    .alterTable('meal_plan_schedule')
    .addUniqueConstraint('unique_meal_plan_schedule', [
      'meal_id',
      'meal_plan_id',
      'assigned_day',
      'type',
      'user_id', 
    ])
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema
    .alterTable('meal_plan_schedule')
    .dropConstraint('unique_meal_plan_schedule')
    .execute()

  await db.schema
    .alterTable('meal_plan_schedule')
    .addUniqueConstraint('unique_meal_plan_schedule', [
      'meal_id',
      'meal_plan_id',
      'assigned_day',
      'type',
    ])
    .execute()
}
